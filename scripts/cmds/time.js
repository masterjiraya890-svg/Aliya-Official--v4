const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "time",
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    countDown: 3,
    shortDescription: "Fetches stylish time card from API",
    category: "tools",
    guide: "/time - Get current neon time card"
  },

  onStart: async ({ message }) => {
    try {
      const wait = await message.reply("⚡ Fetching time card...");

      const apiUrl = "https://xsaim8x-xxx-api.onrender.com/api/time";
      const response = await axios.get(apiUrl, { responseType: "stream" });

      const tmpDir = path.join(__dirname, "cache");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `time_card_${Date.now()}.png`);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.unsend(wait.messageID);
      return message.reply({ attachment: fs.createReadStream(filePath) });

    } catch (err) {
      console.error("Time command error:", err.message);
      return message.reply("❌ Failed to fetch time card.");
    }
  }
};
