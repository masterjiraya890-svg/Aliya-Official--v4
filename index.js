/**
 * @author Mr.king
 * Aliya Official V4
 * Stable Render Launcher
 *
 * Features:
 * - Render PORT support
 * - HTTP health server
 * - Automatic Aliya.js crash recovery
 * - Restart on any unexpected exit
 * - Prevents duplicate child process
 * - Graceful SIGTERM/SIGINT handling
 * - Crash-loop protection
 * - Memory monitoring
 * - Stable process logging
 */

"use strict";

const http = require("http");
const { spawn } = require("child_process");

// ============================================================
// CONFIG
// ============================================================

const PORT = Number(process.env.PORT) || 10000;

const BOT_FILE = "Aliya.js";

const RESTART_DELAY = 5000;

// If Aliya.js crashes too many times in a short period,
// increase the delay instead of creating a restart loop.
const CRASH_WINDOW = 60 * 1000;
const MAX_CRASHES = 8;

// Memory warning threshold
const MEMORY_WARNING_MB = 450;

// ============================================================
// STATE
// ============================================================

let child = null;
let shuttingDown = false;
let restartTimer = null;

let startedAt = Date.now();

let restartCount = 0;
let crashCount = 0;
let crashTimes = [];

let lastExitCode = null;
let lastExitSignal = null;
let lastError = null;

// ============================================================
// HELPERS
// ============================================================

function now() {
    return new Date().toISOString();
}

function log(...args) {
    console.log(`[${now()}]`, ...args);
}

function isChildRunning() {
    return child && child.exitCode === null && !child.killed;
}

function cleanCrashHistory() {
    const current = Date.now();

    crashTimes = crashTimes.filter(
        time => current - time < CRASH_WINDOW
    );
}

function getRestartDelay() {
    cleanCrashHistory();

    if (crashTimes.length >= MAX_CRASHES) {
        return 30000;
    }

    return RESTART_DELAY;
}

// ============================================================
// START BOT
// ============================================================

function startBot() {
    if (shuttingDown) {
        return;
    }

    if (isChildRunning()) {
        log("[INDEX] Aliya.js is already running.");
        return;
    }

    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }

    restartCount++;

    log("========================================");
    log("       ALIYA OFFICIAL V4");
    log("       Owner: Mr.king");
    log(`       Starting ${BOT_FILE}`);
    log(`       Restart count: ${restartCount}`);
    log("========================================");

    try {
        child = spawn(
            process.execPath,
            [BOT_FILE],
            {
                cwd: __dirname,

                // VERY IMPORTANT:
                // Render logs from Aliya.js directly.
                stdio: "inherit",

                shell: false,

                env: {
                    ...process.env,

                    NODE_ENV:
                        process.env.NODE_ENV || "production",

                    PORT: String(PORT)
                }
            }
        );
    }
    catch (error) {
        lastError = error;

        log(
            "[INDEX] Failed to spawn Aliya.js:",
            error
        );

        child = null;

        scheduleRestart();
        return;
    }

    log(`[INDEX] Aliya.js PID: ${child.pid}`);

    // --------------------------------------------------------
    // CHILD ERROR
    // --------------------------------------------------------

    child.on("error", error => {
        lastError = error;

        log(
            "[INDEX] Aliya.js process error:",
            error
        );
    });

    // --------------------------------------------------------
    // CHILD EXIT
    // --------------------------------------------------------

    child.on("exit", (code, signal) => {
        lastExitCode = code;
        lastExitSignal = signal;

        const intentional =
            shuttingDown === true;

        child = null;

        log(
            `[INDEX] Aliya.js exited | code=${code} signal=${signal}`
        );

        if (intentional) {
            log(
                "[INDEX] Shutdown was intentional. No restart."
            );
            return;
        }

        // Any unexpected exit = restart
        crashCount++;

        crashTimes.push(Date.now());

        log(
            `[INDEX] Unexpected bot shutdown detected. Crash count: ${crashCount}`
        );

        scheduleRestart();
    });
}

// ============================================================
// RESTART
// ============================================================

function scheduleRestart() {
    if (shuttingDown) {
        return;
    }

    if (restartTimer) {
        return;
    }

    const delay = getRestartDelay();

    cleanCrashHistory();

    log(
        `[INDEX] Bot will restart in ${delay / 1000}s...`
    );

    restartTimer = setTimeout(() => {
        restartTimer = null;

        if (!shuttingDown) {
            startBot();
        }
    }, delay);
}

// ============================================================
// HTTP HEALTH SERVER
// ============================================================

const server = http.createServer((req, res) => {
    const memory = process.memoryUsage();

    const memoryMB =
        Math.round(
            memory.rss / 1024 / 1024
        );

    const botRunning = isChildRunning();

    // --------------------------------------------------------
    // HEALTH
    // --------------------------------------------------------

    if (req.url === "/health") {
        res.writeHead(
            botRunning ? 200 : 503,
            {
                "Content-Type":
                    "application/json; charset=utf-8",
                "Cache-Control":
                    "no-cache, no-store, must-revalidate"
            }
        );

        res.end(
            JSON.stringify(
                {
                    status: botRunning
                        ? "ok"
                        : "restarting",

                    bot: botRunning
                        ? "online"
                        : "offline",

                    name:
                        "Aliya Official V4",

                    owner:
                        "Mr.king",

                    pid:
                        child?.pid || null,

                    uptime:
                        Math.floor(
                            process.uptime()
                        ),

                    memoryMB,

                    restartCount,

                    crashCount,

                    lastExitCode,

                    lastExitSignal,

                    time:
                        new Date().toISOString()
                },
                null,
                2
            )
        );

        return;
    }

    // --------------------------------------------------------
    // SIMPLE ROOT
    // --------------------------------------------------------

    res.writeHead(
        200,
        {
            "Content-Type":
                "text/plain; charset=utf-8"
        }
    );

    res.end(
        botRunning
            ? "Aliya Official V4 is running."
            : "Aliya Official V4 is restarting..."
    );
});

// ============================================================
// SERVER START
// ============================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {
        startedAt = Date.now();

        log("========================================");
        log("       ALIYA OFFICIAL V4");
        log("       STABLE LAUNCHER");
        log("========================================");

        log(
            `HTTP server: http://0.0.0.0:${PORT}`
        );

        log(
            `Health check: /health`
        );

        log(
            "Bot launcher is ready."
        );

        startBot();
    }
);

// ============================================================
// SERVER ERROR
// ============================================================

server.on("error", error => {
    lastError = error;

    log(
        "[INDEX] HTTP server error:",
        error
    );
});

// ============================================================
// MEMORY MONITOR
// ============================================================

setInterval(() => {
    if (shuttingDown) {
        return;
    }

    const memory =
        process.memoryUsage();

    const rssMB =
        Math.round(
            memory.rss / 1024 / 1024
        );

    if (rssMB >= MEMORY_WARNING_MB) {
        log(
            `⚠️ [MEMORY] High memory usage: ${rssMB} MB`
        );
    }
}, 60000);

// ============================================================
// WATCHDOG
// ============================================================
//
// If Aliya.js somehow disappears without emitting a usable
// state, watchdog starts it again.
//

setInterval(() => {
    if (shuttingDown) {
        return;
    }

    if (!isChildRunning() && !restartTimer) {
        log(
            "⚠️ [WATCHDOG] Bot process is not running."
        );

        scheduleRestart();
    }
}, 15000);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

function shutdown(signal) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    log(
        `[INDEX] ${signal} received. Shutting down...`
    );

    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }

    // Stop child first
    if (child) {
        try {
            log(
                "[INDEX] Stopping Aliya.js..."
            );

            child.kill(signal);
        }
        catch (error) {
            log(
                "[INDEX] Failed to stop Aliya.js:",
                error
            );
        }
    }

    // Close HTTP server
    server.close(() => {
        log(
            "[INDEX] HTTP server closed."
        );

        process.exit(0);
    });

    // Safety timeout
    setTimeout(() => {
        log(
            "[INDEX] Forced shutdown."
        );

        process.exit(0);
    }, 10000).unref();
}

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

// ============================================================
// LAUNCHER ERROR PROTECTION
// ============================================================

process.on(
    "uncaughtException",
    error => {
        lastError = error;

        log(
            "🔥 [INDEX] UNCAUGHT EXCEPTION:",
            error
        );

        // Do NOT immediately kill the Render process.
        // Watchdog/restart system will recover the bot.
    }
);

process.on(
    "unhandledRejection",
    error => {
        lastError = error;

        log(
            "⚠️ [INDEX] UNHANDLED REJECTION:",
            error
        );
    }
);
