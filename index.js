/**
 * @author Mr.king
 * Official source: Aliya Official v4
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
    const child = spawn("node", ["Aliya.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, PORT: process.env.PORT || 1000 }
    });

    child.on("close", (code) => {
        if (code == 2) {
            log.info("Restarting Project...");
            startProject();
        }
    });

    child.on("error", (err) => {
        log.err("INDEX", "Failed to start Aliya.js", err);
    });
}

startProject();
