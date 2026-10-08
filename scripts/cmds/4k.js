const axios = require("axios");

module.exports = {
  config: {
    name: "4k",
    version: "4.0.0",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    shortDescription: "Enhance image to 4K (VIP Only)",
    longDescription: "Reply to an image with 4k to get upscale options",
    category: "image",
    guide: { en: "{p}4k (reply to an image)" }
  },

  onStart: async function ({ api, event, usersData }) {
    const uid = event.senderID;
    const react = (emoji) => api.setMessageReaction(emoji, event.messageID, () => {}, true);

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

    const imageUrl = event.messageReply?.attachments[0]?.url;

    if (!imageUrl || event.messageReply.attachments[0].type !== "photo") {
      react("🖼️");
      return api.sendMessage("🖼️ | Please reply to an image.", event.threadID, event.messageID);
    }

    react("👑");

    const menuMessage = 
      `✨ ─── [ 𝟒𝐊 𝐄𝐍𝐇𝐀𝐍𝐂𝐄𝐑 ] ─── ✨\n\n` +
      `Please reply to this message with a number:\n\n` +
      `1️⃣. Make 4k picture\n` +
      `2️⃣. DSLR picture\n` +
      `3️⃣. Natural picture\n\n` +
      `✨ ───────────────── ✨`;

    return api.sendMessage(menuMessage, event.threadID, (err, info) => {
      if (err) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: uid,
        imageUrl: imageUrl
      });
    }, event.messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    const { author, imageUrl } = Reply;
    const { senderID, body, threadID, messageID } = event;

    if (senderID !== author) {
      return api.sendMessage("❌ | This menu is not for you!", threadID, messageID);
    }

    const react = (emoji) => api.setMessageReaction(emoji, messageID, () => {}, true);

    let prompt = "";

    if (body === "1") {
      prompt = "enhance to 4k ultra realistic, high resolution, ultra detailed photo";
    } else if (body === "2") {
      prompt = "DSLR photography, sharp focus, 8k resolution, professional camera lighting, clear details";
    } else if (body === "3") {
      prompt = "natural look, smooth skin, clear lighting, realistic color balance, HD quality";
    } else {
      react("⚠️");
      return api.sendMessage("⚠️ | Invalid selection! Please reply with 1, 2, or 3.", threadID, messageID);
    }

    react("⏳");

    try {
      const apiUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, { responseType: "stream" });

      react("✅");

      api.sendMessage({
        body: `✨ ───────────────── ✨\n` +
              `ₕₑᵣₑ ᵢₛ ⵇₒᵤᵣ ₑₙₕₐₙcₑd ᵢ☨ₐgₑ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼\n` +
              `📌 Mode: ${body === "1" ? "4K Picture" : body === "2" ? "DSLR Picture" : "Natural Picture"}\n` +
              `✨ ───────────────── ✨`,
        attachment: response.data
      }, threadID, messageID);

    } catch (error) {
      console.error(error);
      react("❌");
      api.sendMessage("❌ | Failed to process the image.", threadID, messageID);
    }
  }
};
