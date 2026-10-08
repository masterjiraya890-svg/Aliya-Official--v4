const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix"],
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: "Mix two emojis together",
    longDescription: "Combine any two emojis to generate a unique mixed version.",
    guide: {
      en: "{pn} <emoji1> <emoji2>\nExample: {pn} 😭 🫦",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const prefix = getPrefix(event.threadID);

      if (args.length < 2) {
        return api.sendMessage(
          `❌ Please provide two emojis.\nExample: ${prefix}emojimix 😭 🫦`,
          event.threadID,
          event.messageID
        );
      }

      const [emoji1, emoji2] = args;

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1
      const apiUrl = `${apiBase}/api/emojimix?emoji1=${encodeURIComponent(
        emoji1
      )}&emoji2=${encodeURIComponent(emoji2)}`;

      const tempDir = path.join(__dirname, "cache");
      await fs.ensureDir(tempDir);
      const imgPath = path.join(tempDir, `emojimix_${Date.now()}.png`);
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (!response.data || response.data.length < 100) {
        return api.sendMessage(
          "❌ Failed to generate mixed emoji image.",
          event.threadID,
          event.messageID
        );
      }

      await fs.writeFile(imgPath, response.data);
      api.sendMessage(
        {
          body: `✨ Emoji Mix Result\n${emoji1} + ${emoji2} = ⬇️`,
          attachment: fs.createReadStream(imgPath),
        },
        event.threadID,
        () => setTimeout(() => fs.unlink(imgPath).catch(() => {}), 500),
        event.messageID
      );
    } catch (error) {
      console.error("EmojiMix Error:", error.message);
      api.sendMessage(
        "❌ Something went wrong while generating emoji mix. Please try again later!",
        event.threadID,
        event.messageID
      );
    }
  },
};
