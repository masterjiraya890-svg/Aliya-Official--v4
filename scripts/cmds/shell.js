const { exec } = require("child_process");

module.exports = {
  config: {
    name: "shell",
    aliases: ["terminal", "bash", "$"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 4, // Strictly Developer Only
    shortDescription: "Execute terminal/shell commands on host server",
    category: "owner",
    guide: "{pn} <command>"
  },

  onStart: async function ({ message, args, role }) {
    if (role < 4) {
      return message.reply("⚙️ 🌸 Only Bot Developers (Role 4) can access shell execution!");
    }

    const command = args.join(" ").trim();
    if (!command) {
      return message.reply("⚠️ Please enter a bash/shell command to execute.\n\nExample: {pn} ls -la");
    }

    message.reply(`⏳ Executing: \`${command}\` ...`, (err, info) => {
      exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        let output = "";

        if (error) {
          output += `❌ Error:\n${error.message}\n\n`;
        }
        if (stderr) {
          output += `⚠️ Stderr:\n${stderr}\n\n`;
        }
        if (stdout) {
          output += `📄 Stdout:\n${stdout}`;
        }

        if (!output.trim()) {
          output = "✅ Command executed successfully with no output.";
        }

        // Truncate output if it exceeds Facebook message limit (~4000 characters)
        if (output.length > 3800) {
          output = output.substring(0, 3800) + "\n\n...[Output Truncated]";
        }

        return message.reply(`𓍢ִ໋🌸✧ ── ͟͟͞͞Sʜᴇʟʟ Oᴜᴛᴘᴜᴛ ── ✧🌸𓍢ִ໋\n\n\`\`\`bash\n${output}\n\`\`\``);
      });
    });
  }
};
