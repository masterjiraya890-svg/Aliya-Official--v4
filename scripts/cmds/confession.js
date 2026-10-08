const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "confession",
    version: "1.1.2",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    countDown: 50,
    role: 0,
    category: "love",
    guide: { en: "{p}confession [reply or mention]" }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    const cost = 10000000; // 10M Economy Balance

    const senderData = await usersData.get(senderID);
    const currentBalance = senderData.money || 0;
    if (currentBalance < cost) {
      return api.sendMessage("❌ confession Korte to chaccho But onak e spam Kore tai 𝔐𝔯.𝔎𝔦𝔫𝔤 re bolo Balance dite tylei hobe", threadID, messageID);
    }

    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else {
      return api.sendMessage("⚠️ Please reply to a user or mention them to make a confession!", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, (err) => {}, true);

      const threadData = await api.getThreadInfo(threadID);
      const { userInfo } = threadData;

      const currentUser = userInfo.find(u => u.id === senderID);
      const targetUser = userInfo.find(u => u.id === targetID);

      const user1Name = currentUser ? currentUser.name : "Sender";
      const user2Name = targetUser ? targetUser.name : "Target";

      const userGender = currentUser && currentUser.gender ? currentUser.gender.toUpperCase() : "MALE";

      const boyID = userGender === "MALE" ? senderID : targetID;
      const girlID = userGender === "FEMALE" ? senderID : targetID;

      // 1000012792_2.jpg হাই-কোয়ালিটি সোর্স লিংক সরাসরি ইমগুর সিডিএন থেকে
      const bgResponse = await axios.get("https://i.ibb.co/HDtQkkk3/1000012792-2.jpg", { responseType: "arraybuffer" });
      const background = await loadImage(Buffer.from(bgResponse.data));

      const tokenStr = "access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const avatarBoyUrl = `https://graph.facebook.com/${boyID}/picture?width=720&height=720&${tokenStr}`;
      const avatarGirlUrl = `https://graph.facebook.com/${girlID}/picture?width=720&height=720&${tokenStr}`;

      const boyResponse = await axios.get(avatarBoyUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.ibb.co/dmw630v/avatar.png", { responseType: "arraybuffer" }));
      const girlResponse = await axios.get(avatarGirlUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.ibb.co/dmw630v/avatar.png", { responseType: "arraybuffer" }));

      const boyImg = await loadImage(Buffer.from(boyResponse.data));
      const girlImg = await loadImage(Buffer.from(girlResponse.data));

      const canvas = createCanvas(1080, 1080);
      const ctx = canvas.getContext("2d");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      ctx.drawImage(background, 0, 0, 1080, 1080);

      // ছেলের অবতার পজিশন (ডান পাশে)
      const bSize = 170; 
      const bx = 620;    
      const by = 210;    

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + bSize / 2, by + bSize / 2, bSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(boyImg, bx, by, bSize, bSize);
      ctx.restore();

      // মেয়ের অবতার পজিশন (বাম পাশে)
      const gSize = 170; 
      const gx = 280;    
      const gy = 100;    

      ctx.save();
      ctx.beginPath();
      ctx.arc(gx + gSize / 2, gy + gSize / 2, gSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(girlImg, gx, gy, gSize, gSize);
      ctx.restore();

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const outputPath = path.join(cacheDir, `confession_${senderID}_${Date.now()}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        await usersData.set(senderID, { money: currentBalance - cost });

        const caption = 
            `╔════════════════════════╗\n` +
            `   💖  𝓒𝓞𝓝𝓕𝓔𝓢𝓢𝓘𝓞𝓝  💖\n` +
            `╚════════════════════════╝\n\n` +
            `👤 From: ${user1Name}\n` +
            `🎯 To: ${user2Name}\n\n` +
            `✨ ❝ My heart dances whenever you are around. You are the rhythm to my life's melody. Will you be mine forever? ❞ ✨\n\n` +
            `✨ ❝ হাজারো মানুষের মাঝে আমার এই চোখ শুধু তোমাকেই খোঁজে। আমার ছোট্ট এই জীবনে তুমি আসবে কি জড়িয়ে হাতটি ধরে? ❞ ✨\n\n` +
            `💝 𝔐𝔯.𝔎𝔦𝔫𝔤 𝓒𝓨𝓑𝓔𝓡 𝓦𝓞𝓡𝓛𝓓 𝓛𝓞𝓥𝓔 𝓔𝓝𝓖𝓘𝓝𝓔 💝`;

        api.sendMessage(
          {
            body: caption,
            mentions: [
              { tag: user1Name, id: senderID },
              { tag: user2Name, id: targetID }
            ],
            attachment: fs.createReadStream(outputPath)
          },
          threadID,
          () => {
            api.setMessageReaction("✅", messageID, (err) => {}, true);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          },
          messageID
        );
      });

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      return api.sendMessage("❌ ছবি তৈরি করতে সমস্যা হয়েছে! দয়া করে আবার চেষ্টা করুন।", threadID, messageID);
    }
  }
};
