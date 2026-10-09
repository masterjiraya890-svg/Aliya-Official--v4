const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    countDown: 5,
    description: { en: "Search or get images from Pinterest." },
    category: "image",
    guide: { en: "Use like: {pn} <text> - [count]" }
  },
  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ").trim();
      if (!input) return api.sendMessage("❌ Use like: pinterest <text> - [count]", event.threadID, event.messageID);
      let query = input, count = 10;
      if (input.includes("-")) {
        const parts = input.split("-");
        query = parts[0].trim();
        count = parseInt(parts[1].trim()) || 10;
      }
      if (count > 50) count = 50;
      const res = await axios.get(`https://azadx69x.is-a.dev/api/pin?text=${encodeURIComponent(query)}&count=${count}`);
      const data = res.data?.data || [];
      if (!data.length) return api.sendMessage(`❌ No images found for "${query}".`, event.threadID, event.messageID);
      const cache = path.join(__dirname, "cache");
      if (!fs.existsSync(cache)) fs.mkdirSync(cache);
      const attachments = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const img = await axios.get(data[i], { responseType: "arraybuffer" });
          const file = path.join(cache, `pin_${Date.now()}_${i}.png`);
          await fs.promises.writeFile(file, img.data);
          attachments.push(fs.createReadStream(file));
        } catch (e) { console.error(e.message); }
      }
      if (!attachments.length) return api.sendMessage(`❌ Failed to fetch any images for "${query}".`, event.threadID, event.messageID);
      await api.sendMessage({ attachment: attachments }, event.threadID, event.messageID);
      attachments.forEach(a => { try { fs.unlinkSync(a.path); } catch {} });
      if (fs.existsSync(cache)) await fs.promises.rm(cache, { recursive: true, force: true });
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Something went wrong. Try again later.", event.threadID, event.messageID);
    }
  }
};
