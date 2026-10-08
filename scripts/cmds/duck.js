const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "duck",
    author: "Saimx69x",
    category: "image",
    version: "1.0",
    role: 0,
    shortDescription: { en: "🦆 Send a random duck image" },
    longDescription: { en: "Fetches a random duck image." },
    guide: { en: "{p}{n} — Shows a random duck image" }
  },

  onStart: async function({ api, event }) {
    try {
      const apiUrl = "https://xsaim8x-xxx-api.onrender.com/api/duck"; // Duck API

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      const tempPath = path.join(__dirname, "duck_temp.jpg");
      fs.writeFileSync(tempPath, buffer);

      await api.sendMessage(
        {
          body: "🦆 Here's a random duck for you!",
          attachment: fs.createReadStream(tempPath)
        },
        event.threadID,
        () => {
      
          fs.unlinkSync(tempPath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to fetch duck image.\n" + err.message, event.threadID, event.messageID);
    }
  }
};
