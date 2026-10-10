/**
 * @author Mr.king x Aliya
 * Aliya Official V4 Engine
 * Ultra Fast Auto-Recovery Launcher
 */

"use strict";

const { spawn } = require("child_process");
const net = require("net");

const BOT_FILE = "Aliya.js";
const RESTART_DELAY = 1000;
const MAX_CRASH_COUNT = 5;
const CRASH_RESET_TIME = 60000; // 1 min

const BANNER = `
  █████╗ ██╗     ██╗██╗   ██╗██████╗     ██╗   ██╗██╗  ██╗
 ██╔══██╗██║     ██║╚██╗ ██╔╝██╔══██╗    ██║   ██║██║  ██║
 ███████║██║     ██║ ╚████╔╝ ██████╔╝    ██║   ██║███████║
 ██╔══██║██║     ██║  ╚██╔╝  ██╔══██╗    ╚██╗ ██╔╝╚════██║
 ██║  ██║███████╗██║   ██║   ██║  ██║     ╚████╔╝      ██║
 ╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝  ╚═╝      ╚═══╝       ╚═╝
`;

let child = null;
let shuttingDown = false;
let restartTimer = null;
let restartCount = 0;
let starting = false;
let crashCount = 0;
let lastCrashTime = Date.now();

// Smart Port Picker (works for anyone who forks this repo)
// - Uses process.env.PORT (Render/Koyeb/Railway) or 8080 by default.
// - If that port is busy, it retries a few times, then falls back to a random free port.
// - The chosen port is passed to the bot (Aliya.js) as process.env.PORT.
// - No dummy server here: the bot owns the port, so bot OFF = server OFF.
const PREFERRED_PORT = Number(process.env.PORT) || 8080;

function isPortFree(port) {
    return new Promise(resolve => {
        const tester = net.createServer();
        tester.once("error", () => resolve(false));
        tester.once("listening", () => tester.close(() => resolve(true)));
        tester.listen(port, "0.0.0.0");
    });
}

function getRandomFreePort() {
    return new Promise((resolve, reject) => {
        const tester = net.createServer();
        tester.once("error", reject);
        tester.listen(0, "0.0.0.0", () => {
            const port = tester.address().port;
            tester.close(() => resolve(port));
        });
    });
}

async function pickPort() {
    for (let i = 0; i < 5; i++) {
        if (await isPortFree(PREFERRED_PORT)) return PREFERRED_PORT;
        await new Promise(r => setTimeout(r, 500));
    }
    const port = await getRandomFreePort();
    log("⚠️", "PORT", `Port ${PREFERRED_PORT} is busy. Using free port ${port} instead.`);
    return port;
}

function now() {
    return new Date().toTimeString().split(' ')[0];
}

function log(symbol, tag, msg) {
    console.log(`[${now()}] ${symbol} [${tag}] ──► ${msg}`);
}

function isChildRunning() {
    return child && child.exitCode === null && !child.killed;
}

async function startBot() {
    if (shuttingDown || starting) return;

    if (isChildRunning()) {
        log("⚠️", "INDEX", "Aliya.js is already running!");
        return;
    }

    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }

    starting = true;
    let botPort;
    try {
        botPort = await pickPort();
    } catch (e) {
        starting = false;
        log("❌", "PORT_FAIL", e.message);
        scheduleRestart();
        return;
    }
    starting = false;
    if (shuttingDown) return;

    restartCount++;

    console.log("\n" + BANNER);
    console.log(" ╔═══════════════════════════════════════════════════════════╗");
    console.log(" ║              👑 ALIYA OFFICIAL V4 ENGINE                  ║");
    console.log(" ║              👤 DEVELOPER : Mr.king                      ║");
    console.log(` ║              🔄 LAUNCH COUNT : ${String(restartCount).padEnd(25)} ║`);
    console.log(" ╚═══════════════════════════════════════════════════════════╝\n");

    try {
        child = spawn(process.execPath, [BOT_FILE], {
            cwd: __dirname,
            stdio: "inherit",
            shell: false,
            env: { ...process.env, PORT: String(botPort) }
        });
    } catch (error) {
        log("❌", "SPAWN_FAIL", `Failed to start ${BOT_FILE}: ${error.message}`);
        child = null;
        scheduleRestart();
        return;
    }

    log("🚀", "SYSTEM", `Bot core spawned | Process PID: [ ${child.pid} ]`);

    child.on("error", error => {
        log("❌", "PROCESS_ERR", `Error in ${BOT_FILE}: ${error.message}`);
    });

    child.on("exit", (code, signal) => {
        child = null;
        log("💀", "EXIT", `Stopped | Code: [ ${code} ] | Signal: [ ${signal} ]`);

        if (shuttingDown) return;

        // Code 0/130 means intentionally stopped/killed by admin
        if (code === 0) {
            log("🛑", "STOP", "Bot stopped / ID logged out. Server turning OFF...");
            shuttingDown = true;
            process.exit(0);
        }

        // Crash-Loop Protection
        const currentTime = Date.now();
        if (currentTime - lastCrashTime < CRASH_RESET_TIME) {
            crashCount++;
        } else {
            crashCount = 1;
        }
        lastCrashTime = currentTime;

        if (crashCount >= MAX_CRASH_COUNT) {
            log("🚨", "CRASH_GUARD", `Too many crashes (${crashCount} times within 1 minute). Pausing restart for 30s to prevent spam...`);
            setTimeout(() => {
                crashCount = 0;
                scheduleRestart();
            }, 30000);
            return;
        }

        log("⚠️", "AUTO_HEAL", `Crash detected! Total Consecutive Crashes: [ ${crashCount} ]`);
        scheduleRestart();
    });
}

function scheduleRestart() {
    if (shuttingDown || restartTimer) return;

    log("🛡️", "RECOVERY", `Re-booting in ${RESTART_DELAY / 1000}s...`);

    restartTimer = setTimeout(() => {
        restartTimer = null;
        if (!shuttingDown) startBot();
    }, RESTART_DELAY);
}

// Watchdog Anti-Hang Protection
setInterval(() => {
    if (!shuttingDown && !isChildRunning() && !restartTimer && !starting) {
        log("⚠️", "WATCHDOG", "Bot is inactive! Forcing start...");
        scheduleRestart();
    }
}, 10000);

// Graceful Shutdown
function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    log("⚠️", "SHUTDOWN", `${signal} received. Cleaning up...`);
    if (restartTimer) clearTimeout(restartTimer);
    if (child) {
        try { child.kill(signal); } catch (e) {}
    }
    process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", err => log("❌", "UNCAUGHT", err.message));
process.on("unhandledRejection", err => log("⚠️", "UNHANDLED", err.message));

// Directly launch engine
startBot();
          
