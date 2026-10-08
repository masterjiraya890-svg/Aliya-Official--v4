const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "npmtest",
    aliases: ["pkgtest", "testpkg"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 4,
    description: {
      en: "Test installed NPM packages or run dynamic package tests"
    },
    category: "owner",
    guide: "{pn} <package_name> | {pn} <package_name> <code>"
  },

  onStart: async function ({ message, args, role, prefix }) {
    if (role < 4) {
      return message.reply("⚙️ 🌸 Only Bot Developers (Role 4) can test NPM packages!");
    }

    const pkgName = args[0];

    if (!pkgName) {
      const usageText = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞NPM Pᴀᴄᴋᴀɢᴇ Tᴇsᴛᴇʀ ── ✧🌸𓍢ִ໋  

ᥫ᭡ ${prefix}npmtest <package_name>
(Checks if package is installed and loads correctly)

ᥫ᭡ ${prefix}npmtest axios const res = await axios.get('https://api.github.com'); out(res.status);
(Tests custom package code directly)`;
      return message.reply(usageText);
    }

    const customCode = args.slice(1).join(" ");

    // 1. Basic Import & Version Test
    if (!customCode) {
      return message.reply(`⏳ Testing package loading: \`${pkgName}\`...`, () => {
        try {
          const loadedModule = require(pkgName);
          let pkgVersion = "Unknown";

          try {
            const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
            if (fs.existsSync(pkgJsonPath)) {
              pkgVersion = fs.readJsonSync(pkgJsonPath).version || pkgVersion;
            }
          } catch (e) {}

          const moduleType = typeof loadedModule;
          const keys = loadedModule && typeof loadedModule === "object" ? Object.keys(loadedModule).slice(0, 10).join(", ") : "N/A";

          const resultMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Tᴇsᴛ Rᴇsᴜʟᴛ ── ✧🌸𓍢ִ໋

✅ Status: Successfully Loaded
📦 Package: \`${pkgName}\`
📌 Version: \`${pkgVersion}\`
🧩 Type: \`${moduleType}\`
🔑 Keys/Methods: \`${keys || "None"}\``;

          return message.reply(resultMsg);
        } catch (err) {
          return message.reply(`❌ [ Package Test Failed ]\n\n\`\`\`text\n${err.message}\n\`\`\``);
        }
      });
    }

    // 2. Custom Execution Test with Code
    return message.reply(`⏳ Executing test script for \`${pkgName}\`...`, async () => {
      try {
        const pkg = require(pkgName);
        
        const out = (data) => {
          let strData = typeof data !== "string" ? require("util").inspect(data, { depth: 2 }) : data;
          return message.reply(`🧪 [ Test Output ]\n\n\`\`\`javascript\n${strData}\n\`\`\``);
        };

        const testAsync = new Function("pkg", pkgName, "out", "require", `return (async () => { ${customCode} })();`);
        await testAsync(pkg, pkg, out, require);

      } catch (err) {
        return message.reply(`❌ [ Code Execution Error ]\n\n\`\`\`text\n${err.stack || err.message || err}\n\`\`\``);
      }
    });
  }
};
