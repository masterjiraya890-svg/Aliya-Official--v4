const axios = require("axios");

module.exports = {
  config: {
    name: "rbg",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Remove background reply image",
    longDescription: "Remove background URL or replying to an image",
    category: "image",
    guide: { en: "{p}rbg <image_url>\nOR\nReply image + {p}rbg" }
  },
  onStart: async function ({ api, event, args }) {
    let loadMsg;
    try {
      const img = event.messageReply?.attachments?.[0]?.url || args[0];
      if (!img) return api.sendMessage("❌ Please reply to an image or provide a URL.", event.threadID, event.messageID);
      loadMsg = await api.sendMessage("😺 Removing Background...\n⏳ Please Wait...", event.threadID);
      const res = await axios.get(`https://azadx69x.is-a.dev/api/rbg?url=${encodeURIComponent(img)}`, { responseType: "stream" });
      await api.sendMessage({ body: "✅ Background Removed!", attachment: res.data }, event.threadID, event.messageID);
      if (loadMsg) api.unsendMessage(loadMsg.messageID);
    } catch (e) {
      console.error(e);
      if (loadMsg) api.unsendMessage(loadMsg.messageID);
      api.sendMessage("❌ Image Process Failed!", event.threadID, event.messageID);
    }
  }
};
