const axios = require("axios");

module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    author: "Aliya",
    countDown: 5,
    role: 0,
    shortDescription: "Get Aliya Bot v4 Repository Link",
    longDescription: "Sends the official GitHub repository and fork link of Aliya Bot v4 with an image",
    category: "system",
    guide: {
      en: "{p}fork"
    }
  },

  onStart: async function ({ message, event }) {
    const imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Bajq7KeozS19EhsrKZXtn9MxZoTSyE0TxcaByeRNew&s=10";
    
    const textMessage = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Source Code ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ 𝚁𝚎𝚙𝚘𝚜𝚒𝚝𝚘𝚛𝚢 : 𝙰𝚕𝚒𝚢𝚊-𝙾𝚏𝚏𝚒𝚌𝚒𝚊𝚕--𝚟𝟺
ᥫ᭡ 𝙾𝚠𝚗𝚎𝚛 / 𝙳𝚎𝚟 : 𝚖𝚊𝚜𝚝𝚎𝚛𝚓𝚒𝚛𝚊𝚢𝚊𝟾𝟿𝟶-𝚜𝚟𝚐

🌸 𝙲𝚕𝚒𝚌𝚔 𝚝𝚑𝚎 𝚕𝚒𝚗𝚔 𝚋𝚎𝚕𝚘𝚠 𝚝𝚘 𝙵𝚘𝚛𝚔 :
🔗 https://github.com/masterjiraya890-svg/Aliya-Official--v4/tree/main

✧─────── ͟͟͞͞Aliya Bot System ───────✧`;

    try {
      // Fetch image stream to attach with message
      const imageStream = (await axios.get(imageUrl, { responseType: "stream" })).data;
      
      return message.reply({
        body: textMessage,
        attachment: imageStream
      });
    } catch (error) {
      // Fallback in case image loading fails
      return message.reply(textMessage);
    }
  }
};
    
