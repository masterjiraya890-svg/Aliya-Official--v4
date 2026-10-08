const axios = require("axios");

module.exports = {
  config: {
    name: "freetogame",
    aliases: ["freegame", "ftg"],
    version: "1.0.0",
    author: "Mr.King",
    role: 0,
    category: "games",
    shortDescription: "Get random free-to-play game or filter by category",
    guide: "{pn} | {pn} <category>"
  },

  onStart: async function ({ api, event, args, message }) {
    const category = args.join(" ").toLowerCase().trim();
    let url = "https://www.freetogame.com/api/games";

    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(url);
      const gamesList = response.data;

      if (!Array.isArray(gamesList) || gamesList.length === 0) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`𓍢ִ໋🌸✧ Nᴏ ɢᴀᴍᴇs ғᴏᴜɴᴅ ғᴏʀ Cᴀᴛᴇɢᴏʀʏ "${category}"! ✧🌸𓍢ִ໋`);
      }

      const randomGame = gamesList[Math.floor(Math.random() * gamesList.length)];

      const title = randomGame.title || "Unknown";
      const genre = randomGame.genre || "N/A";
      const platform = randomGame.platform || "N/A";
      const publisher = randomGame.publisher || "N/A";
      const developer = randomGame.developer || "N/A";
      const description = randomGame.short_description || "No description available.";
      const gameUrl = randomGame.game_url || "N/A";
      const thumbnail = randomGame.thumbnail;

      const replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Fʀᴇᴇ Tᴏ Gᴀᴍᴇ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Tɪᴛʟᴇ : ${title}
ᥫ᭡ Gᴇɴʀᴇ : ${genre}
ᥫ᭡ Pʟᴀᴛғᴏʀᴍ : ${platform}
ᥫ᭡ Dᴇᴠᴇʟᴏᴘᴇʀ : ${developer}
ᥫ᭡ Pᴜʙʟɪsʜᴇʀ : ${publisher}

🌸 ─── Dᴇsᴄʀɪᴘᴛɪᴏɴ ─── 🌸
${description}

ᥫ᭡ Pʟᴀʏ Lɪɴᴋ : ${gameUrl}

𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

      const msgData = { body: replyMsg };

      if (thumbnail) {
        const imgStream = (await axios.get(thumbnail, { responseType: "stream" })).data;
        msgData.attachment = imgStream;
      }

      api.setMessageReaction("🎮", event.messageID, () => {}, true);
      return message.reply(msgData);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("𓍢ִ໋🌸✧ Fᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ɢᴀᴍᴇs ғʀᴏᴍ FʀᴇᴇTᴏGᴀᴍᴇ! ✧🌸𓍢ִ໋");
    }
  }
};
