const axios = require("axios");

module.exports = {
  config: {
    name: "4k",
    version: "4.0.0",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    shortDescription: "Enhance image to 4K (VIP Only)",
    longDescription: "Reply to an image with 4k to upscale directly",
    category: "image",
    guide: { en: "{p}4k (reply to an image)" }
  },

  onStart: async function ({ api, event, usersData, message }) {
    const uid = event.senderID;
    const react = (emoji) => api.setMessageReaction(emoji, event.messageID, () => {}, true);

    const user = await usersData.get(uid);
    const vipData = user?.data?.vip;

    if (!vipData || !vipData.expires || vipData.expires <= Date.now()) {
      react("❌");
      return message.reply(
        "• ❌ 𝑻𝒉𝒊𝒔 𝒄𝒐𝒎𝒎𝒂𝒏𝒅 𝒊𝒔 𝒐𝒏𝒍𝒚 𝒇𝒐𝒓 👑 𝑽𝑰𝑷 𝒖𝒔𝒆𝒓𝒔!\n\n" +
        "📌 𝑼𝒔𝒆 {𝒑}𝒗𝒊𝒑 𝒕𝒐 𝒄𝒉𝒆𝒄𝒌 𝒗𝒊𝒑 𝒑𝒓𝒊𝒄𝒆𝒔 𝒂𝒏𝒅 𝒔𝒖𝒃𝒔𝒄𝒓𝒊𝒃𝒆."
      );
    }

    const imageUrl = event.messageReply?.attachments[0]?.url;

    if (!imageUrl || event.messageReply.attachments[0].type !== "photo") {
      react("🖼️");
      return message.reply("🖼️ | Please reply to an image.");
    }

    react("⏳");

    try {
      const prompt = "enhance to 4k ultra realistic, high resolution, ultra detailed photo";
      const apiUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, { responseType: "stream" });

      react("✅");

      return message.reply({
        body: `✨ ───────────────── ✨\n` +
              `Here is your img 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
              `✨ ───────────────── ✨`,
        attachment: response.data
      });

    } catch (error) {
      console.error(error);
      react("❌");
      return message.reply("❌ | Failed to process the image to 4K.");
    }
  }
};
