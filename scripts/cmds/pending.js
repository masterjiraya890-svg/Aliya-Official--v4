const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ownerInfo = {
  name: "masterjiraya890-svg",
  contact: "https://m.me/masterjiraya001",
  supportGroup: "https://m.me/j/AbY50_CsjwrZMPkP/?send_source=gc%3Acopy_invite_link_t"
};

module.exports = {
  config: {
    name: "pending",
    version: "4.0.0",
    author: "Aliya Bot v4",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Approve or refuse pending threads"
    },
    longDescription: {
      en: "Reply with thread numbers to approve or reply with c[number(s)] / cancel[number(s)] to refuse."
    },
    category: "admin"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "Refused %1 thread(s)!",
      approveSuccess: "Approved successfully %1 thread(s)!",
      cantGetPendingList: "Can't get the pending list!",
      returnListPending:
        "𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Pending List ── ✧🌸𓍢ִ໋🌷͙֒\n\nᥫ᭡ Total Pending Threads: %1\n\n%2\n\n💡 Guide:\n- Approve: Reply with numbers (e.g., 1 2 3)\n- Refuse: Reply with c[number] or cancel[number] (e.g., c 1 2 or cancel 3)",
      returnListClean: "𓍢ִ໋🌸✧ Pending list is completely clean! ✧🌸"
    }
  },

  onReply: async function ({ api, event, Reply, getLang, message }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;
    const BOT_UID = api.getCurrentUserID();
    const API_ENDPOINT = "https://xsaim8x-xxx-api.onrender.com/api/botconnect";

    const lowerBody = body.trim().toLowerCase();

    if (lowerBody.startsWith("c") || lowerBody.startsWith("cancel")) {
      const trimmed = body.replace(/^(c|cancel)\s*/i, "").trim();
      const index = trimmed.split(/\s+/).filter(Boolean);

      if (index.length === 0)
        return message.reply("Please provide at least one thread number to cancel.");

      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length) {
          message.reply(getLang("invaildNumber", i));
          continue;
        }

        const targetThreadID = Reply.pending[parseInt(i) - 1].threadID;
        try {
          await api.removeUserFromGroup(BOT_UID, targetThreadID);
          count++;
        } catch (error) {
          console.error(`⚠️ Failed to remove bot from thread ${targetThreadID}:`, error.message);
        }
      }

      return message.reply(getLang("cancelSuccess", count));
    } else {
      const index = body.split(/\s+/).filter(Boolean);
      if (index.length === 0)
        return message.reply("Please provide at least one thread number to approve.");

      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length) {
          message.reply(getLang("invaildNumber", i));
          continue;
        }

        const targetThread = Reply.pending[parseInt(i) - 1].threadID;
        const prefix = global.utils.getPrefix(targetThread);
        const nickNameBot = global.GoatBot.config.nickNameBot || "Aliya Bot v4";

        try {
          await api.changeNickname(nickNameBot, targetThread, BOT_UID);
        } catch (err) {
          console.warn(`⚠️ Nickname change failed for ${targetThread}:`, err.message);
        }

        try {
          const apiUrl = `${API_ENDPOINT}?botuid=${BOT_UID}&prefix=${encodeURIComponent(prefix)}`;
          const tmpDir = path.join(__dirname, "..", "cache");
          await fs.ensureDir(tmpDir);
          const imagePath = path.join(tmpDir, `botconnect_image_${targetThread}.png`);

          const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
          fs.writeFileSync(imagePath, response.data);

          const textMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Group Connected Successfully ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ 𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}
ᥫ᭡ 𝐔𝐬𝐚𝐠𝐞 : Type ${prefix}help to see all commands

✧─────── ͟͟͞͞Aliya Bot System ───────✧
👑 𝐎𝐰𝐧𝐞𝐫 : ${ownerInfo.name}
💬 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 : ${ownerInfo.contact}
🤖 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐆𝐂 : ${ownerInfo.supportGroup}`;

          await api.sendMessage(
            {
              body: textMsg,
              attachment: fs.createReadStream(imagePath)
            },
            targetThread
          );

          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        } catch (err) {
          console.error(`⚠️ Error sending botconnect message to ${targetThread}:`, err);

          const fallbackMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Group Connected Successfully ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ 𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}
ᥫ᭡ 𝐔𝐬𝐚𝐠𝐞 : Type ${prefix}help to see all commands

✧─────── ͟͟͞͞Aliya Bot System ───────✧
👑 𝐎𝐰𝐧𝐞𝐫 : ${ownerInfo.name}
💬 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 : ${ownerInfo.contact}
🤖 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐆𝐂 : ${ownerInfo.supportGroup}`;

          api.sendMessage(fallbackMsg, targetThread);
        }

        count++;
      }

      return message.reply(getLang("approveSuccess", count));
    }
  },

  onStart: async function ({ api, event, getLang, commandName, message }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(g => g.isSubscribed && g.isGroup);

      for (const item of list) msg += `${index++}. ${item.name} (${item.threadID})\n`;

      if (list.length !== 0) {
        return api.sendMessage(
          getLang("returnListPending", list.length, msg),
          threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              pending: list
            });
          },
          messageID
        );
      } else {
        return message.reply(getLang("returnListClean"));
      }
    } catch (e) {
      return message.reply(getLang("cantGetPendingList"));
    }
  }
};
          
