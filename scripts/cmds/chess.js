const axios = require("axios");

module.exports = {
  config: {
    name: "chess",
    aliases: ["puzz", "puzzles"],
    version: "1.0.0",
    author: "Mr.King",
    role: 0,
    category: "games",
    shortDescription: "Get Chess.com player profile, stats or daily puzzle",
    guide: "{pn} <username> | {pn} puzzle"
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").trim();

    if (!input) {
      return message.reply("𓍢ִ໋🌸✧ Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ a Chess.com ᴜsᴇʀɴᴀᴍᴇ ᴏʀ ᴛʏᴘᴇ \"chess puzzle\"! ✧🌸𓍢ִ໋");
    }

    const headers = { "User-Agent": "GoatBot-ChessPlugin/1.0" };

    /* ───── Daily Puzzle ───── */
    if (input.toLowerCase() === "puzzle") {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      try {
        const response = await axios.get("https://api.chess.com/pub/puzzle", { headers });
        const data = response.data;

        const replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Cʜᴇss Dᴀɪʟʏ Pᴜᴢᴢʟᴇ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Tɪᴛʟᴇ : ${data.title}
ᥫ᭡ Lɪɴᴋ : ${data.url}

𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

        const msgData = { body: replyMsg };
        if (data.image) {
          const imgStream = (await axios.get(data.image, { responseType: "stream" })).data;
          msgData.attachment = imgStream;
        }

        api.setMessageReaction("♟️", event.messageID, () => {}, true);
        return message.reply(msgData);
      } catch (err) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("𓍢ִ໋🌸✧ Fᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴅᴀɪʟʏ ᴘᴜᴢᴢʟᴇ! ✧🌸𓍢ִ໋");
      }
    }

    /* ───── Player Profile & Stats ───── */
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        axios.get(`https://api.chess.com/pub/player/${input}`, { headers }),
        axios.get(`https://api.chess.com/pub/player/${input}/stats`, { headers })
      ]);

      const profile = profileRes.data;
      const stats = statsRes.data;

      const username = profile.username;
      const followers = profile.followers || 0;
      const status = profile.status || "N/A";
      const avatar = profile.avatar;

      const rapid = stats.chess_rapid?.last?.rating || "Unrated";
      const blitz = stats.chess_blitz?.last?.rating || "Unrated";
      const bullet = stats.chess_bullet?.last?.rating || "Unrated";

      const replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Cʜᴇss Pʟᴀʏᴇʀ Sᴛᴀᴛs ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ U sᴇʀɴᴀᴍᴇ : ${username}
ᥫ᭡ Sᴛᴀᴛᴜs : ${status}
ᥫ᭡ Fᴏʟʟᴏᴡᴇʀs : ${followers}

🌸 ─── Rᴀᴛɪɴɢs ─── 🌸
ᥫ᭡ Rᴀᴘɪᴅ : ${rapid}
ᥫ᭡ Bʟɪᴛᴢ : ${blitz}
ᥫ᭡ Bᴜʟʟᴇᴛ : ${bullet}

𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

      const msgData = { body: replyMsg };
      if (avatar) {
        const imgStream = (await axios.get(avatar, { responseType: "stream" })).data;
        msgData.attachment = imgStream;
      }

      api.setMessageReaction("♟️", event.messageID, () => {}, true);
      return message.reply(msgData);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(`𓍢ִ໋🌸✧ Pʟᴀʏᴇʀ "${input}" ɴᴏᴛ ғᴏᴜɴᴅ ᴏɴ Cʜᴇss.ᴄᴏᴍ! ✧🌸𓍢ִ໋`);
    }
  }
};
