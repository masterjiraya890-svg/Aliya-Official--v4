const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    version: "0.0.8",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    shortDescription: "Edit image (VIP Only)",
    longDescription: "Reply to any image with prompt to edit",
    category: "image",
    guide: "{pn} [text]"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const uid = event.senderID;
    const react = (emoji) => api.setMessageReaction(emoji, event.messageID, () => {}, true);

    // VIP Validation Check
    const user = await usersData.get(uid);
    const vipData = user?.data?.vip;

    if (!vipData || !vipData.expires || vipData.expires <= Date.now()) {
      react("❌");
      return api.sendMessage(
        "• ❌ 𝑻𝒉𝒊𝒔 𝒄𝒐𝒎𝒎𝒂𝒏𝒅 𝒊𝒔 𝒐𝒏𝒍𝒚 𝒇𝒐𝒓 👑 𝑽𝑰𝑷 𝒖𝒔𝒆𝒓𝒔!\n\n" +
        "📌 𝑼𝒔𝒆 {𝒑}𝒗𝒊𝒑 𝒕𝒐 𝒄𝒉𝒆𝒄𝒌 𝒗𝒊𝒑 𝒑𝒓𝒊𝒄𝒆𝒔 𝒂𝒏𝒅 𝒔𝒖𝒃𝒔𝒄𝒓𝒊𝒃𝒆.",
        event.threadID
      );
    }

    try {
      const prompt = args.join(" ").trim();

      if (!prompt) {
        react("⚠️");
        return api.sendMessage("⚠️ | Please provide text.", event.threadID);
      }

      const imageUrl = event.messageReply?.attachments[0]?.url;

      if (!imageUrl) {
        react("🖼️");
        return api.sendMessage("🖼️ | Please reply to an image.", event.threadID);
      }

      react("⏳");

      const apiUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, { responseType: "stream" });

      react("✅");

      api.sendMessage({
        body: `✨ ───────────────── ✨\n` +
              `ₕₑᵣₑ ᵢₛ ₒᵤᵣ ₑdᵢₜₑd ᵢₘₐgₑ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
              `📝 Prompt: ${prompt}\n` +
              `✨ ───────────────── ✨`,
        attachment: response.data
      }, event.threadID);

    } catch (error) {
      console.error(error);
      react("❌");
      api.sendMessage("❌ | Failed to process image.", event.threadID);
    }
  }
};
