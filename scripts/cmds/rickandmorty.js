const axios = require("axios");

module.exports = {
  config: {
    name: "rickandmorty",
    aliases: ["rickmorty"],
    version: "1.0.0",
    author: "Mr.King",
    role: 0,
    category: "anime",
    shortDescription: "Search Rick and Morty characters or get a random one",
    guide: "{pn} | {pn} <character_name>"
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").trim();
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let character;

      if (!input) {
        // Get total count first for random picking
        const countRes = await axios.get("https://rickandmortyapi.com/api/character");
        const totalCharacters = countRes.data.info.count;
        const randomId = Math.floor(Math.random() * totalCharacters) + 1;

        const charRes = await axios.get(`https://rickandmortyapi.com/api/character/${randomId}`);
        character = charRes.data;
      } else {
        // Search character by name
        const searchRes = await axios.get(`https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(input)}`);
        const results = searchRes.data.results;

        if (!results || results.length === 0) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply(`𓍢ִ໋🌸✧ Cʜᴀʀᴀᴄᴛᴇʀ "${input}" ɴᴏᴛ ғᴏᴜɴᴅ! ✧🌸𓍢ִ໋`);
        }

        character = results[0];
      }

      const name = character.name || "Unknown";
      const status = character.status || "Unknown";
      const species = character.species || "Unknown";
      const gender = character.gender || "Unknown";
      const origin = character.origin?.name || "Unknown";
      const location = character.location?.name || "Unknown";
      const image = character.image;

      const replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Rɪᴄᴋ & Mᴏʀᴛʏ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Nᴀᴍᴇ : ${name}
ᥫ᭡ Sᴛᴀᴛᴜs : ${status}
ᥫ᭡ Sᴘᴇᴄɪᴇs : ${species}
ᥫ᭡ Gᴇɴᴅᴇʀ : ${gender}
ᥫ᭡ Oʀɪɢɪɴ : ${origin}
ᥫ᭡ Lᴏᴄᴀᴛɪᴏɴ : ${location}

𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

      const msgData = { body: replyMsg };

      if (image) {
        const imgStream = (await axios.get(image, { responseType: "stream" })).data;
        msgData.attachment = imgStream;
      }

      api.setMessageReaction("🧪", event.messageID, () => {}, true);
      return message.reply(msgData);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("𓍢ִ໋🌸✧ Cʜᴀʀᴀᴄᴛᴇʀ ɴᴏᴛ ғᴏᴜɴᴅ ᴏʀ API ᴇʀʀᴏʀ! ✧🌸𓍢ִ໋");
    }
  }
};
