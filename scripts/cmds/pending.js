const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ownerInfo = {
  name: "𝐄w'𝐫 𝐒𝐚𝐢𝐦",
  facebook: "https://facebook.com/61565898444113",
  telegram: "@saimx69x",
  supportGroup: "https://m.me/j/AbZP4jRGu45w70du/"
};

module.exports = {
  config: {
    name: "pending",
    version: "2.0",
    author: "Saimx69x",
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
        "»「PENDING」«❮ Total pending threads: %1 ❯\n\n%2\n\n💡 Guide:\n- Approve: reply with numbers (e.g. 1 2 3)\n- Refuse: reply with c[number(s)] or cancel[number(s)] (e.g. c 1 2 or cancel 3 4)",
      returnListClean: "「PENDING」There is no thread in the pending list"
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
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
        return api.sendMessage(
          "Please provide at least one thread number to cancel.",
          threadID,
          messageID
        );

      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length) {
          api.sendMessage(getLang("invaildNumber", i), threadID);
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

      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    }

    else {
      const index = body.split(/\s+/).filter(Boolean);
      if (index.length === 0)
        return api.sendMessage("Please provide at least one thread number to approve.", threadID, messageID);

      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length) {
          api.sendMessage(getLang("invaildNumber", i), threadID);
          continue;
        }

        const targetThread = Reply.pending[parseInt(i) - 1].threadID;
        const prefix = global.utils.getPrefix(targetThread);
        const nickNameBot = global.GoatBot.config.nickNameBot || "Aliya Bot";

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

          const textMsg = [
            "✅ 𝐆𝐫𝐨𝐮𝐩 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 🎊",
            `🔹 𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}`,
            `🔸 𝐓𝐲𝐩𝐞: ${prefix}help 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `👑 𝐎𝐰𝐧𝐞𝐫: ${ownerInfo.name}`,
            `🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: ${ownerInfo.facebook}`,
            `✈️ 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦: ${ownerInfo.telegram}`,
            `🤖 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐆𝐂: ${ownerInfo.supportGroup}`
          ].join("\n");

          await api.sendMessage(
            {
              body: textMsg,
              attachment: fs.createReadStream(imagePath)
            },
            targetThread
          );

          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error(`⚠️ Error sending botconnect message to ${targetThread}:`, err);

          const fallbackMsg = [
            "❌ Image generation failed. Here's the info:",
            "✅ Group Connected Successfully 🎊",
            `🔹 Prefix: ${prefix}`,
            `🔸 Type: ${prefix}help for commands`,
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            `👑 Owner: ${ownerInfo.name}`,
            `🌐 Facebook: ${ownerInfo.facebook}`,
            `✈️ Telegram: ${ownerInfo.telegram}`,
            `🤖 Support GC: ${ownerInfo.supportGroup}`
          ].join("\n");
          api.sendMessage(fallbackMsg, targetThread);
        }

        count++;
      }

      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(g => g.isSubscribed && g.isGroup);

      for (const item of list) msg += `${index++}/ ${item.name} (${item.threadID})\n`;

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
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
