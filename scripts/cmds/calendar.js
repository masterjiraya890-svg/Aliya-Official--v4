const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cacheDirectory = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "calendar",
    version: "1.0",
    author: "Saimx69x",
    shortDescription: "🗓️ Stylish English Calendar via API",
    longDescription: "Fetches calendar image from API for Asia/Dhaka",
    category: "utility",
    guide: { en: "{p}calendar" }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get(
        "https://xsaim8x-xxx-api.onrender.com/api/calendar",
        { responseType: "arraybuffer" }
      );

      const imgBuffer = Buffer.from(response.data, "binary");

      await fs.promises.mkdir(cacheDirectory, { recursive: true });
      const filePath = path.join(cacheDirectory, "calendar.png");
      await fs.promises.writeFile(filePath, imgBuffer);

      api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("Calendar command error:", err.message);
      api.sendMessage(
        "❌ Failed to fetch calendar image from API.",
        event.threadID,
        event.messageID
      );
    }
  }
};
