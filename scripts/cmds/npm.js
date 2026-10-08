const { exec } = require("child_process");

module.exports = {
  config: {
    name: "npm",
    aliases: ["pkg", "package"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 4, // Strictly Bot Dev (Role 4)
    shortDescription: "Manage NPM packages directly from bot",
    category: "owner",
    guide: "{pn} install <pkg> | {pn} uninstall <pkg> | {pn} list"
  },

  onStart: async function ({ message, args, role, prefix }) {
    if (role < 4) {
      return message.reply("⚙️ 🌸 Only Bot Developers (Role 4) can access NPM package management!");
    }

    const action = args[0]?.toLowerCase();

    if (!action) {
      const usageText = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞NPM Pᴀᴄᴋᴀɢᴇ Mᴀɴᴀɢᴇʀ ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ ${prefix}npm install <package_name>
ᥫ᭡ ${prefix}npm install canvas gifencoder
ᥫ᭡ ${prefix}npm uninstall <package_name>
ᥫ᭡ ${prefix}npm list`;
      return message.reply(usageText);
    }

    // ========== LIST PACKAGES ==========
    if (action === "list" || action === "ls") {
      return message.reply("⏳ Checking installed dependencies...", (err, info) => {
        exec("npm list --depth=0", { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
          let result = stdout || stderr || error?.message || "No dependencies found.";
          
          if (result.length > 3800) {
            result = result.slice(0, 3800) + "\n\n...[Output Truncated]";
          }

          return message.reply(`𓍢ִ໋🌸✧ ── ͟͟͞͞Iɴsᴛᴀʟʟᴇᴅ Pᴀᴄᴋᴀɢᴇs ── ✧🌸𓍢ִ໋\n\n\`\`\`bash\n${result}\n\`\`\``);
        });
      });
    }

    // ========== INSTALL PACKAGES ==========
    if (action === "install" || action === "i" || action === "add") {
      const packages = args.slice(1);

      if (packages.length === 0) {
        return message.reply("⚠️ Please enter package name(s) to install!\nExample: {pn} install canvas");
      }

      const safePackages = packages.filter(pkg => /^[@a-zA-Z0-9\-_\/\.]+$/.test(pkg));

      if (safePackages.length === 0) {
        return message.reply("❌ Invalid package name format detected!");
      }

      const cmd = `npm install ${safePackages.join(" ")} --save`;

      return message.reply(`⏳ Installing packages: \`${safePackages.join(", ")}\` ...`, (err, info) => {
        exec(cmd, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 15 }, (error, stdout, stderr) => {
          let output = "";

          if (error) {
            output += `❌ Error:\n${error.message}\n\n`;
          }
          if (stdout) output += `✅ Output:\n${stdout}\n`;
          if (stderr) output += `⚠️ Stderr:\n${stderr}`;

          if (!output.trim()) {
            output = "✅ Packages installed successfully with no output.";
          }

          if (output.length > 3800) {
            output = output.substring(0, 3800) + "\n\n...[Output Truncated]";
          }

          return message.reply(`𓍢ִ໋🌸✧ ── ͟͟͞͞Iɴsᴛᴀʟʟ Rᴇsᴜʟᴛ ── ✧🌸𓍢ִ໋\n\n\`\`\`bash\n${output}\n\`\`\``);
        });
      });
    }

    // ========== UNINSTALL PACKAGES ==========
    if (action === "uninstall" || action === "remove" || action === "rm") {
      const packages = args.slice(1);

      if (packages.length === 0) {
        return message.reply("⚠️ Please enter package name(s) to uninstall!\nExample: {pn} uninstall canvas");
      }

      const safePackages = packages.filter(pkg => /^[@a-zA-Z0-9\-_\/\.]+$/.test(pkg));

      if (safePackages.length === 0) {
        return message.reply("❌ Invalid package name format detected!");
      }

      const cmd = `npm uninstall ${safePackages.join(" ")}`;

      return message.reply(`⏳ Uninstalling packages: \`${safePackages.join(", ")}\` ...`, () => {
        exec(cmd, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
          let output = stdout || stderr || error?.message || "Finished execution.";

          if (output.length > 3800) {
            output = output.substring(0, 3800) + "\n\n...[Output Truncated]";
          }

          return message.reply(`𓍢ִ໋🌸✧ ── ͟͟͞͞Uɴɪɴsᴛᴀʟʟ Rᴇsᴜʟᴛ ── ✧🌸𓍢ִ໋\n\n\`\`\`bash\n${output}\n\`\`\``);
        });
      });
    }

    return message.reply("❌ Invalid syntax! Use: install, uninstall, or list");
  }
};
      
