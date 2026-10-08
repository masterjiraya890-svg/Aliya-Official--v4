const axios = require("axios");

module.exports = {
  config: {
    name: "pokemon",
    aliases: ["poke", "pokedex"],
    version: "1.0.0",
    author: "Mr.King",
    role: 0,
    category: "games",
    shortDescription: "Get Pokemon details from PokeAPI",
    guide: "{pn} <pokemon_name>"
  },

  onStart: async function ({ api, event, args, message }) {
    const name = args.join(" ").toLowerCase().trim();

    if (!name) {
      return message.reply("𓍢ִ໋🌸✧ Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ Pᴏᴋᴇ́ᴍᴏɴ ɴᴀᴍᴇ! (ᴇ.ɢ. pokemon pikachu) ✧🌸𓍢ִ໋");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = response.data;

      const pokeName = data.name.toUpperCase();
      const pokeId = data.id;
      const height = data.height / 10; // Convert to meters
      const weight = data.weight / 10; // Convert to kg
      const types = data.types.map(t => t.type.name).join(", ");
      const abilities = data.abilities.map(a => a.ability.name).join(", ");
      const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

      const replyMsg = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Pᴏᴋᴇ́ᴍᴏɴ Iɴғᴏ ── ✧🌸𓍢ִ໋🌷͙֒ ᥫ᭡—͞  

ᥫ᭡ Nᴀᴍᴇ : ${pokeName} (#${pokeId})
ᥫ᭡ Tʏᴘᴇ : ${types}
ᥫ᭡ Hᴇɪɢʜᴛ : ${height} m
ᥫ᭡ Wᴇɪɢʜᴛ : ${weight} kg
ᥫ᭡ Aʙɪʟɪᴛɪᴇs : ${abilities}

𓍢ִ໋🌷 Mᴀɪɴᴛᴀɪɴᴇʀ : Mʀ.Kɪɴɢ ☠️✌🏼`;

      const msgData = { body: replyMsg };

      if (imageUrl) {
        const imgStream = (await axios.get(imageUrl, { responseType: "stream" })).data;
        msgData.attachment = imgStream;
      }

      api.setMessageReaction("🔥", event.messageID, () => {}, true);
      return message.reply(msgData);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(`𓍢ִ໋🌸✧ Pᴏᴋᴇ́ᴍᴏɴ "${name}" ɴᴏᴛ ғᴏᴜɴᴅ! Pʟᴇᴀsᴇ Cʜᴇᴄᴋ Sᴘᴇʟʟɪɴɢ. ✧🌸𓍢ִ໋`);
    }
  }
};
