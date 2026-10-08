module.exports = {
  config: {
    name: "npx",
    aliases: ["noprefix"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 1, // Minimum Group Admin required to configure
    shortDescription: "Manage prefixless command system in v4",
    category: "system",
    guide: "{pn} all | {pn} <cmd_name> | {pn} role <0-4> | {pn} off"
  },

  onStart: async function ({ message, args, event, threadsData }) {
    const threadID = event.threadID;
    let npxConfig = (await threadsData.get(threadID, "data.npxConfig")) || {
      all: false,
      commands: [],
      roles: []
    };

    const action = args[0]?.toLowerCase();

    if (!action) {
      const statusText = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aʟɪʏᴀ v4 NPX Sᴇᴛᴛɪɴɢs ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ Aʟʟ Cᴏᴍᴍᴀɴᴅs : ${npxConfig.all ? "🟢 Enabled" : "🔴 Disabled"}
ᥫ᭡ Pʀᴇғɪxʟᴇss Cᴍᴅs : ${npxConfig.commands.length > 0 ? npxConfig.commands.join(", ") : "None"}
ᥫ᭡ Aʟʟᴏᴡᴇᴅ Rᴏʟᴇs : ${npxConfig.roles.length > 0 ? npxConfig.roles.join(", ") : "None"}

𓍢ִ໋🌷 Sʏɴᴛᴀx U sᴀɢᴇ:
 ᥫ᭡ {pn} all ── Tᴏɢɢʟᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs
 ᥫ᭡ {pn} <cmd> ── Tᴏɢɢʟᴇ sᴘᴇᴄɪғɪᴄ ᴄᴏᴍᴍᴀɴᴅ
 ᥫ᭡ {pn} role <0-4> ── Set role access
 ᥫ᭡ {pn} off ── Rᴇsᴇᴛ ᴀʟʟ NPX sᴇᴛᴛɪɴɢs`;
      return message.reply(statusText);
    }

    if (action === "all") {
      npxConfig.all = !npxConfig.all;
      await threadsData.set(threadID, npxConfig, "data.npxConfig");
      return message.reply(
        `𓍢ִ໋🌸✧ NPX All-Commands Mode is now ${npxConfig.all ? "🟢 ENABLED" : "🔴 DISABLED"}!`
      );
    }

    if (action === "off" || action === "reset") {
      npxConfig = { all: false, commands: [], roles: [] };
      await threadsData.set(threadID, npxConfig, "data.npxConfig");
      return message.reply("𓍢ִ໋🌸✧ All NPX prefixless settings have been reset!");
    }

    if (action === "role") {
      const targetRole = parseInt(args[1]);
      if (isNaN(targetRole) || targetRole < 0 || targetRole > 4) {
        return message.reply("⚠️ Invalid role! Allowed values: 0 (All), 1 (Admin), 2 (VIP), 3 (Bot Admin), 4 (Dev)");
      }

      if (npxConfig.roles.includes(targetRole)) {
        npxConfig.roles = npxConfig.roles.filter((r) => r !== targetRole);
        await threadsData.set(threadID, npxConfig, "data.npxConfig");
        return message.reply(`𓍢ִ໋🌸✧ Role level [ ${targetRole} ] removed from NPX mode.`);
      } else {
        npxConfig.roles.push(targetRole);
        await threadsData.set(threadID, npxConfig, "data.npxConfig");
        return message.reply(`𓍢ִ໋🌸✧ Role level [ ${targetRole} ] granted prefixless access!`);
      }
    }

    // Toggle specific command
    const targetCmd = action.toLowerCase();
    const commandExists = global.GoatBot.commands.get(targetCmd) || global.GoatBot.commands.get(global.GoatBot.aliases.get(targetCmd));

    if (!commandExists) {
      return message.reply(`❌ Command or alias "${targetCmd}" does not exist in bot registry!`);
    }

    const realCmdName = commandExists.config.name;

    if (npxConfig.commands.includes(realCmdName)) {
      npxConfig.commands = npxConfig.commands.filter((c) => c !== realCmdName);
      await threadsData.set(threadID, npxConfig, "data.npxConfig");
      return message.reply(`𓍢ִ໋🌸✧ Prefixless mode disabled for command: "${realCmdName}"`);
    } else {
      npxConfig.commands.push(realCmdName);
      await threadsData.set(threadID, npxConfig, "data.npxConfig");
      return message.reply(`𓍢ִ໋🌸✧ Prefixless mode enabled for command: "${realCmdName}"`);
    }
  }
};
