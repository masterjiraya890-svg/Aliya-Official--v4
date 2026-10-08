/**
 * @author Mr.king
 * Aliya Official V4 
 */

const http = require("http");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT) || 10000;

let child = null;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    if (req.url === "/health") {
        res.end(
            child && !child.killed
                ? "Aliya Official V4 is running"
                : "Aliya Official V4 is starting"
        );
        return;
    }

    res.end("Aliya Official V4");
});

function startBot() {
    if (child && !child.killed) return;

    console.log("========================================");
    console.log("       ALIYA OFFICIAL V4");
    console.log("       Owner: Mr.king");
    console.log("       Starting bot...");
    console.log("========================================");

    child = spawn(process.execPath, ["Aliya.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: false,
        env: {
            ...process.env,
            PORT: String(PORT)
        }
    });

    child.on("error", (err) => {
        console.error("[INDEX] Failed to start Aliya.js:", err);
        child = null;

        setTimeout(startBot, 5000);
    });

    child.on("close", (code) => {
        child = null;

        console.log(`[INDEX] Aliya.js stopped. Exit code: ${code}`);

        // Aliya.js uses code 2 for intentional restart
        if (code === 2) {
            console.log("[INDEX] Restart requested. Restarting...");
            setTimeout(startBot, 2000);
        }
    });
}

server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Aliya Official V4 HTTP server running on port ${PORT}`);
    console.log(`❤️ Health: /health`);

    startBot();
});

process.on("SIGTERM", () => {
    console.log("[INDEX] SIGTERM received");

    if (child && !child.killed) {
        child.kill("SIGTERM");
    }

    server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
    console.log("[INDEX] SIGINT received");

    if (child && !child.killed) {
        child.kill("SIGINT");
    }

    server.close(() => process.exit(0));
});
