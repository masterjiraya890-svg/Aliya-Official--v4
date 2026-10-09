const axios = require("axios");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://aliya-album.vercel.app";
const REQUIRED_AUTHOR = "Mr.king";

module.exports = {
  config: {
    name: "album",
    version: "4.5.0",
    author: "Mr.king",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get media or list categories from Aliya Album"
    },
    longDescription: {
      en: "Fetch categories from site and send video attachments on reply"
    },
    category: "media",
    guide: {
      en: "{p}album [page number]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (this.config.author !== REQUIRED_AUTHOR) {
      return api.sendMessage("❌ Command Author altered! Access permanently revoked.", threadID, messageID);
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/public/categories`);
      if (res.data.status !== "success") {
        return api.sendMessage("❌ Category list fetch korte problem hoyeche!", threadID, messageID);
      }

      const categories = res.data.data;
      if (!categories || categories.length === 0) {
        return api.sendMessage("⚠️ Website-e kuno active category paowa jayni!", threadID, messageID);
      }

      const itemsPerPage = 10;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(categories.length / itemsPerPage);

      if (page < 1 || page > totalPages) {
        return api.sendMessage(`❌ Invalid page! Please choose between 1 - ${totalPages}.`, threadID, messageID);
      }

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const displayedCategories = categories.slice(startIndex, endIndex);

      let message = `—͞Aliya_ᥫ᭡—͞🌷\n` +
        `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 𝐋𝐢𝐬𝐭 🎀\n` +
        `𐙚━━━━━━━━━━━━━━━━━━━━ᡣ𐭩\n` +
        displayedCategories.map((cat, index) => `${index + 1}. ${cat.categoryName}`).join("\n") +
        `\n𐙚━━━━━━━━━━━━━━━━━━━━ᡣ𐭩\n` +
        `♻ | 𝐏𝐚𝐠𝐞 [${page}/${totalPages}]\n` +
        `ℹ | 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 (1-10) 𝐭𝐨 𝐠𝐞𝐭 𝐯𝐢𝐝𝐞𝐨.`;

      if (page < totalPages) {
        message += `\nℹ | 𝐓𝐲𝐩𝐞 (album ${page + 1}) 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞.`;
      }

      return api.sendMessage(message, threadID, (error, info) => {
        if (error) return;

        const replyData = {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          displayedCategories: displayedCategories
        };

        if (global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, replyData);
        } else if (global.client && global.client.handleReply) {
          global.client.handleReply.push({
            messageID: info.messageID,
            name: this.config.name,
            author: senderID,
            displayedCategories: displayedCategories
          });
        }
      }, messageID);

    } catch (err) {
      return api.sendMessage(`❌ Error: ${err.response?.data?.message || err.message}`, threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply, handleReply }) {
    const replyData = Reply || handleReply;
    const { threadID, messageID, body } = event;

    if (this.config.author !== REQUIRED_AUTHOR) {
      return api.sendMessage("❌ Command Author altered! Access permanently revoked.", threadID, messageID);
    }

    if (replyData.messageID) {
      api.unsendMessage(replyData.messageID);
    }

    const replyIndex = parseInt(body.trim()) - 1;
    const displayedCategories = replyData.displayedCategories;

    if (isNaN(replyIndex) || replyIndex < 0 || replyIndex >= displayedCategories.length) {
      return api.sendMessage(`❌ Invalid choice! Reply with a number from 1 to ${displayedCategories.length}.`, threadID, messageID);
    }

    const selectedCategory = displayedCategories[replyIndex];
    const categoryName = selectedCategory.categoryName;
    const categoryId = selectedCategory._id || selectedCategory.id;

    if (api.setMessageReaction) {
      api.setMessageReaction("🎀", messageID, (err) => {}, true);
    }

    const tempFilePath = path.join(__dirname, `album_temp_${Date.now()}_${Math.floor(Math.random()*1000)}.mp4`);

    try {
      const mediaRes = await axios.get(`${BASE_URL}/api/public/media`, {
        params: {
          categoryName: categoryName,
          categoryId: categoryId || "",
          author: this.config.author
        }
      });

      if (mediaRes.data.status !== "success") {
        return api.sendMessage(`❌ ${mediaRes.data.message || "No video found in this category!"}`, threadID, messageID);
      }

      const downloadUrl = mediaRes.data.url;

      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        const cleanCatName = categoryName.toLowerCase().includes("video") ? categoryName : `${categoryName} Video`;
        
        const caption = `—͞ғᴀᴄᴇʙᴏᴏᴋ_ᥫ᭡—͞🌷\n` +
                        `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 ${cleanCatName} 🌸\n` +
                        `👑 𝐎𝐰𝐧𝐞𝐫: ${REQUIRED_AUTHOR}`;

        api.sendMessage({
          body: caption,
          attachment: fs.createReadStream(tempFilePath)
        }, threadID, () => {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }, messageID);
      });

      writer.on("error", () => {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        api.sendMessage("❌ Failed to download video attachment!", threadID, messageID);
      });

    } catch (err) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return api.sendMessage(`❌ Error: ${err.response?.data?.message || err.message}`, threadID, messageID);
    }
  }
};
