const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const FOLDER_ID = "1U4yM0YILj0dTx1tpYxK2Vasc3SSuoADC";

const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

function roleText(role) {
  if (role === 0) return "Aʟʟ Usᴇʀs";
  if (role === 1) return "Gʀᴏᴜᴘ Aᴅᴍɪɴs";
  if (role === 2) return "Bᴏᴛ Aᴅᴍɪɴ";
  return "Uɴᴋɴᴏᴡɴ";
}

function findCommand(name) {
  name = name.toLowerCase();
  for (const [, cmd] of commands) {
    const a = cmd.config?.aliases;
    if (cmd.config?.name === name) return cmd;
    if (Array.isArray(a) && a.includes(name)) return cmd;
    if (typeof a === "string" && a === name) return cmd;
  }
  return null;
}

async function getRandomVideoPath() {
  try {
    const response = await axios.get(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`).catch(async () => {
      return await axios.get(`https://docs.google.com/uc?export=list&id=${FOLDER_ID}`);
    });

    const htmlData = response.data;
    const matches = [...htmlData.matchAll(/"([^"]+)"\s*,\s*\[\s*"([^"]+)"\s*,\s*([0-9]+)\s*,\s*"([^"]+)"/g)];
    
    let fileId = "";
    if (!matches || matches.length === 0) {
      const fallbackMatches = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/g)];
      if (fallbackMatches.length === 0) return null;
      fileId = fallbackMatches[Math.floor(Math.random() * fallbackMatches.length)][1];
    } else {
      const randomMatch = matches[Math.floor(Math.random() * matches.length)];
      fileId = randomMatch[1];
    }

    const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const filePath = path.join(cacheDir, `help_video_${Date.now()}.mp4`);
    const downloadStream = await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    downloadStream.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        resolve(null);
      });
    });
  } catch (err) {
    return null;
  }
}

function sendAutoDeleteMessage(api, message, content) {
  return message.reply(content, (err, info) => {
    if (!err && info && info.messageID) {
      setTimeout(() => {
        if (api.unsendMessage) api.unsendMessage(info.messageID);
      }, 120000);
    }
  });
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "4.1.0",
    author: "Mr.King",
    role: 0,
    category: "info",
    shortDescription: "Show all commands with random anime video in Pookie Style",
    guide: "{pn} | {pn} <page_number> | {pn} <command>"
  },

  onStart: async function ({ api, message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const input = args.join(" ").trim();

    const categories = {};
    let totalCmds = 0;

    for (const [name, cmd] of commands) {
      if (!cmd?.config || cmd.config.role > role) continue;
      const cat = (cmd.config.category || "UNCATEGORIZED").toUpperCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      totalCmds++;
    }

    const catNames = Object.keys(categories);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(catNames.length / itemsPerPage) || 1;

    if (input && isNaN(input)) {
      const cmd = findCommand(input);
      if (!cmd) return sendAutoDeleteMessage(api, message, `𓍢ִ໋🌸✧ ── Cᴏᴍᴍᴀɴᴅ "${input}" ɴᴏᴛ ғᴏᴜɴᴅ! ── ✧🌸𓍢ִ໋`);

      const c = cmd.config;
      const aliasText = Array.isArray(c.aliases) ? c.aliases.join(", ") : c.aliases || "Nᴏɴᴇ";
      
      let usage = c.guide?.en || c.guide || "Nᴏ ᴜsᴀɢᴇ ᴘʀᴏᴠɪᴅᴇᴅ";
      if (typeof usage === "string") {
        usage = usage.replace(/{pn}/g, `${prefix}${c.name}`);
      }

      const infoMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Cᴏᴍᴍᴀɴᴅ Dᴇᴛᴀɪʟs ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Nᴀᴍᴇ : ${c.name}
ᥫ᭡ Cᴀᴛᴇɢᴏʀʏ : ${(c.category || "UNCATEGORIZED").toUpperCase()}
ᥫ᭡ Dᴇsᴄʀɪᴘᴛɪᴏɴ : ${c.shortDescription || "N/A"}
ᥫ᭡ Aʟɪᴀsᴇs : ${aliasText}
ᥫ᭡ Vᴇʀsɪᴏɴ : ${c.version || "1.0"}
ᥫ᭡ Pᴇʀᴍɪssɪᴏɴ : ${roleText(c.role)}
ᥫ᭡ Cᴏᴏʟᴅᴏᴡɴ : ${c.countDown || 5}s
ᥫ᭡ Aᴜᴛʜᴏʀ : ${c.author || "Uɴᴋɴᴏᴡɴ"}
ᥫ᭡ Usᴀɢᴇ : ${usage}

𓍢ִ໋🌷 Aᴜᴛᴏ ᴅᴇʟᴇᴛɪɴɢ ɪɴ 2 ᴍɪɴᴜᴛᴇs... ✨`;

      return sendAutoDeleteMessage(api, message, infoMsg);
    }

    let page = parseInt(input) || 1;
    if (page < 1 || page > totalPages) page = 1;

    const pageCats = catNames.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    let helpText = `𓍢ִ໋🌸✧ ── ͟͟͞͞Cᴏᴍᴍᴀɴᴅ Mᴇɴᴜ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  \n\n`;
    helpText += `🌸 Pᴀɢᴇ : ${page}/${totalPages} ✧ Tᴏᴛᴀʟ : ${totalCmds} Cᴍᴅs\n`;
    helpText += `🌸 Pʀᴇғɪx : ${prefix}\n\n`;

    pageCats.forEach((cat) => {
      helpText += `𓍢ִ໋🌷͙֒ ✨ ── ${cat} ── ✨\n`;
      const cmds = categories[cat];
      helpText += `ᥫ᭡ ${cmds.join(" • ")}\n\n`;
    });

    helpText += `𓍢ִ໋🌸✧ Rᴇᴘʟʏ ᴘᴀɢᴇ ɴᴜᴍʙᴇʀ (1-${totalPages}) ᴛᴏ sᴡɪᴛᴄʜ ᴘᴀɢᴇ\n`;
    helpText += `𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const videoPath = await getRandomVideoPath();
    const msgData = { body: helpText };

    if (videoPath && fs.existsSync(videoPath)) {
      msgData.attachment = fs.createReadStream(videoPath);
    }

    return message.reply(msgData, (err, info) => {
      if (videoPath && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      if (!err && info) {
        api.setMessageReaction("🔥", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "help",
          messageID: info.messageID,
          author: event.senderID,
          totalPages: totalPages
        });

        setTimeout(() => {
          if (api.unsendMessage) api.unsendMessage(info.messageID);
        }, 120000);
      } else {
        api.setMessageReaction("📌", event.messageID, () => {}, true);
      }
    });
  },

  onReply: async function ({ api, message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const page = parseInt(event.body.trim());
    if (isNaN(page) || page < 1 || page > Reply.totalPages) return;

    const prefix = getPrefix(event.threadID);
    const categories = {};
    let totalCmds = 0;

    for (const [name, cmd] of commands) {
      if (!cmd?.config) continue;
      const cat = (cmd.config.category || "UNCATEGORIZED").toUpperCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      totalCmds++;
    }

    const catNames = Object.keys(categories);
    const itemsPerPage = 6;
    const pageCats = catNames.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    let helpText = `𓍢ִ໋🌸✧ ── ͟͟͞͞Cᴏᴍᴍᴀɴᴅ Mᴇɴᴜ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  \n\n`;
    helpText += `🌸 Pᴀɢᴇ : ${page}/${Reply.totalPages} ✧ Tᴏᴛᴀʟ : ${totalCmds} Cᴍᴅs\n`;
    helpText += `🌸 Pʀᴇғɪx : ${prefix}\n\n`;

    pageCats.forEach((cat) => {
      helpText += `𓍢ִ໋🌷͙֒ ✨ ── ${cat} ── ✨\n`;
      const cmds = categories[cat];
      helpText += `ᥫ᭡ ${cmds.join(" • ")}\n\n`;
    });

    helpText += `𓍢ִ໋🌸✧ Rᴇᴘʟʏ ᴘᴀɢᴇ ɴᴜᴍʙᴇʀ (1-${Reply.totalPages}) ᴛᴏ sᴡɪᴛᴄʜ ᴘᴀɢᴇ\n`;
    helpText += `𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const videoPath = await getRandomVideoPath();
    const msgData = { body: helpText };

    if (videoPath && fs.existsSync(videoPath)) {
      msgData.attachment = fs.createReadStream(videoPath);
    }

    return message.reply(msgData, (err, info) => {
      if (videoPath && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      if (api.unsendMessage) api.unsendMessage(Reply.messageID);

      if (!err && info) {
        api.setMessageReaction("🔥", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "help",
          messageID: info.messageID,
          author: event.senderID,
          totalPages: Reply.totalPages
        });

        setTimeout(() => {
          if (api.unsendMessage) api.unsendMessage(info.messageID);
        }, 120000);
      }
    });
  }
};
