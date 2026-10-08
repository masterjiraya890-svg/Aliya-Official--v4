/**
 * @author Mr.king
 * Aliya Official V4
 * Port-Free Ultra Fast Launcher
 */

"use strict";

const { spawn } = require("child_process");

const BOT_FILE = "Aliya.js";
const RESTART_DELAY = 1000; // 1 Second Instant Recovery

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
let crashCount = 0;

function now() {
    return new Date().toTimeString().split(' ')[0];
}

function log(symbol, tag, msg) {
    console.log(`[${now()}] ${symbol} [${tag}] ──► ${msg}`);
}

function isChildRunning() {
    return child && child.exitCode === null && !child.killed;
}

function startBot() {
    if (shuttingDown) return;

    if (isChildRunning()) {
        log("⚠️", "INDEX", "Aliya.js is already running!");
        return;
    }

    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }

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
            env: process.env
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

        crashCount++;
        log("⚠️", "AUTO_HEAL", `Crash detected! Total Crashes: [ ${crashCount} ]`);
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
    if (!shuttingDown && !isChildRunning() && !restartTimer) {
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
        
