/**
 * @author NTKhang
 * Official source: https://github.com/ntkhang03/Goat-Bot-V2
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
    const child = spawn("node", ["Sakura.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, PORT: process.env.PORT || 1000 } // Port 1000 default
    });

    child.on("close", (code) => {
        if (code == 2) {
            log.info("Restarting Project...");
            startProject();
        }
    });

    child.on("error", (err) => {
        log.err("INDEX", "Failed to start Sakura.js", err);
    });
}

startProject();
