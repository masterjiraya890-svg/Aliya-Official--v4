/**
 * @author Mr.king
 * Aliya Official V4
 * Ultra-Stable Cyber-Engine Launcher
 */

"use strict";

const http = require("http");
const { spawn } = require("child_process");

// ============================================================
// CONFIG & DESIGN CONSTANTS
// ============================================================

const PORT = Number(process.env.PORT) || 10000;
const BOT_FILE = "Aliya.js";
const RESTART_DELAY = 2000;
const MEMORY_WARNING_MB = 450;

// ASCII Banner & Cyber Styling
const BANNER = `
  █████╗ ██╗     ██╗██╗   ██╗██████╗     ██╗   ██╗██╗  ██╗
 ██╔══██╗██║     ██║╚██╗ ██╔╝██╔══██╗    ██║   ██║██║  ██║
 ███████║██║     ██║ ╚████╔╝ ██████╔╝    ██║   ██║███████║
 ██╔══██║██║     ██║  ╚██╔╝  ██╔══██╗    ╚██╗ ██╔╝╚════██║
 ██║  ██║███████╗██║   ██║   ██║  ██║     ╚████╔╝      ██║
 ╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝  ╚═╝      ╚═══╝       ╚═╝
`;

const SYMBOLS = {
    info: "⚡",
    success: "❇️",
    warning: "⚠️",
    error: "❌",
    skull: "💀",
    rocket: "🚀",
    shield: "🛡️"
};

// ============================================================
// STATE MANAGEMENT
// ============================================================

let child = null;
let shuttingDown = false;
let restartTimer = null;
let startedAt = Date.now();

let restartCount = 0;
let crashCount = 0;

let lastExitCode = null;
let lastExitSignal = null;
let lastError = null;

// ============================================================
// STYLISH LOGGERS
// ============================================================

function now() {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
}

function cyberLog(symbol, tag, msg) {
    console.log(`[${now()}] ${symbol} [${tag}] ──► ${msg}`);
}

function isChildRunning() {
    return child && child.exitCode === null && !child.killed;
}

// ============================================================
// BOT ENGINE LAUNCHER
// ============================================================

function startBot() {
    if (shuttingDown) return;

    if (isChildRunning()) {
        cyberLog(SYMBOLS.warning, "INDEX", "Aliya.js is already running in background!");
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
            env: {
                ...process.env,
                NODE_ENV: process.env.NODE_ENV || "production",
                PORT: String(PORT)
            }
        });
    } catch (error) {
        lastError = error;
        cyberLog(SYMBOLS.error, "SPAWN_FAIL", `Failed to spawn ${BOT_FILE}: ${error.message}`);
        child = null;
        scheduleRestart();
        return;
    }

    cyberLog(SYMBOLS.rocket, "SYSTEM", `Bot core spawned successfully | Process PID: [ ${child.pid} ]`);

    child.on("error", error => {
        lastError = error;
        cyberLog(SYMBOLS.error, "PROCESS_ERR", `Internal error in ${BOT_FILE}: ${error.message}`);
    });

    child.on("exit", (code, signal) => {
        lastExitCode = code;
        lastExitSignal = signal;

        const intentional = shuttingDown === true;
        child = null;

        cyberLog(SYMBOLS.skull, "EXIT", `Process stopped | Exit Code: [ ${code} ] | Signal: [ ${signal} ]`);

        if (intentional) {
            cyberLog(SYMBOLS.info, "SHUTDOWN", "Shutdown was initiated by developer. Stopping engine.");
            return;
        }

        crashCount++;
        cyberLog(SYMBOLS.warning, "AUTO_HEAL", `Unexpected exit detected! Total Crashes: [ ${crashCount} ]`);
        scheduleRestart();
    });
}

// ============================================================
// INSTANT AUTO-RECOVER RESTART
// ============================================================

function scheduleRestart() {
    if (shuttingDown) return;
    if (restartTimer) return;

    cyberLog(SYMBOLS.shield, "RECOVERY", `Re-booting ${BOT_FILE} in ${RESTART_DELAY / 1000}s...`);

    restartTimer = setTimeout(() => {
        restartTimer = null;
        if (!shuttingDown) {
            startBot();
        }
    }, RESTART_DELAY);
}

// ============================================================
// HTTP SERVER WITH EADDRINUSE AUTOMATIC BYPASS
// ============================================================

const server = http.createServer((req, res) => {
    const memory = process.memoryUsage();
    const memoryMB = Math.round(memory.rss / 1024 / 1024);
    const botRunning = isChildRunning();

    if (req.url === "/health") {
        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate"
        });

        res.end(
            JSON.stringify(
                {
                    engine: "Aliya V4 Cyber-Launcher",
                    status: botRunning ? "ONLINE" : "RECOVERING",
                    developer: "Mr.king",
                    pid: child?.pid || null,
                    uptimeSeconds: Math.floor(process.uptime()),
                    memoryUsageMB: memoryMB,
                    restarts: restartCount,
                    crashes: crashCount,
                    timestamp: new Date().toISOString()
                },
                null,
                2
            )
        );
        return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
        <body style="background:#0a0a10;color:#00f0ff;font-family:monospace;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
            <div style="text-align:center;border:2px solid #00f0ff;padding:40px;border-radius:15px;box-shadow:0 0 20px rgba(0,240,255,0.4);">
                <h1>👑 ALIYA V4 CYBER ENGINE</h1>
                <p style="color:#00ff7f;font-size:18px;">Status: <b>${botRunning ? "ONLINE & ACTIVE 🟢" : "RESTARTING... 🟡"}</b></p>
                <p style="color:#aaa;">Developer: Mr.king ☠️</p>
            </div>
        </body>
    `);
});

function listenServer(targetPort) {
    server.listen(targetPort, "0.0.0.0", () => {
        startedAt = Date.now();
        cyberLog(SYMBOLS.success, "HTTP", `Web Server active on port: http://0.0.0.0:${targetPort}`);
        cyberLog(SYMBOLS.info, "HEALTH", `Health Dashboard available at /health`);
        startBot();
    });
}

server.on("error", error => {
    lastError = error;

    if (error.code === "EADDRINUSE") {
        cyberLog(SYMBOLS.warning, "PORT_BUSY", `Port ${PORT} is occupied! Bypassing HTTP server collision & running bot engine...`);
        if (!isChildRunning()) {
            startBot();
        }
    } else {
        cyberLog(SYMBOLS.error, "HTTP_ERR", `Server error: ${error.message}`);
    }
});

listenServer(PORT);

// ============================================================
// SYSTEM MONITORS & WATCHDOG
// ============================================================

setInterval(() => {
    if (shuttingDown) return;

    const memory = process.memoryUsage();
    const rssMB = Math.round(memory.rss / 1024 / 1024);

    if (rssMB >= MEMORY_WARNING_MB) {
        cyberLog(SYMBOLS.warning, "MEMORY", `High RAM usage detected: ${rssMB} MB`);
    }
}, 60000);

setInterval(() => {
    if (shuttingDown) return;

    if (!isChildRunning() && !restartTimer) {
        cyberLog(SYMBOLS.warning, "WATCHDOG", "Bot is inactive without active timer! Forcing start...");
        scheduleRestart();
    }
}, 10000);

// ============================================================
// SHUTDOWN & PROTECTIONS
// ============================================================

function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    cyberLog(SYMBOLS.warning, "SHUTDOWN", `${signal} signal received. Cleaning up processes...`);

    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }

    if (child) {
        try {
            child.kill(signal);
        } catch (e) {}
    }

    server.close(() => {
        process.exit(0);
    });

    setTimeout(() => {
        process.exit(0);
    }, 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", error => {
    lastError = error;
    cyberLog(SYMBOLS.error, "UNCAUGHT", error.stack || error.message);
});

process.on("unhandledRejection", error => {
    lastError = error;
    cyberLog(SYMBOLS.warning, "UNHANDLED", error.stack || error.message);
});
    
