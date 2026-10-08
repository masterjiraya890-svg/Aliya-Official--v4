const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair3",
    version: "1.1.0",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    countDown: 10,
    role: 0,
    category: "love",
    guide: { en: "{p}pair3" }
  },

  onStart: async function ({ api, event, usersData, message }) {
    const { threadID, messageID, senderID } = event;
    const cost = 10000; 

    // ১. ব্যালেন্স চেক
    const senderData = await usersData.get(senderID);
    const currentBalance = senderData.money || 0;
    if (currentBalance < cost) {
      return api.sendMessage("⚠️ আপনার পর্যাপ্ত ব্যালেন্স নেই! ম্যাচ খুঁজতে ১০,০০০ (10k) প্রয়োজন।", threadID, messageID);
    }

    try {
      api.setMessageReaction("✨", messageID, (err) => {}, true);

      const threadData = await api.getThreadInfo(threadID);
      const { userInfo } = threadData;

      // ইউজার ডাটা ও জেন্ডার ফিল্টারিং
      const currentUser = userInfo.find(u => u.id === senderID);
      if (!currentUser || !currentUser.gender) {
        return api.sendMessage("⚠️ আপনার প্রোফাইলে জেন্ডার সেট করা নেই!", threadID, messageID);
      }

      const userGender = currentUser.gender.toUpperCase();
      let matchCandidates = [];

      if (userGender === "MALE") {
        matchCandidates = userInfo.filter(u => u.gender === "FEMALE" && u.id !== senderID);
      } else if (userGender === "FEMALE") {
        matchCandidates = userInfo.filter(u => u.gender === "MALE" && u.id !== senderID);
      } else {
        matchCandidates = userInfo.filter(u => u.id !== senderID);
      }

      if (matchCandidates.length === 0) {
        api.setMessageReaction("🥺", messageID, (err) => {}, true);
        return api.sendMessage("⚠️ এই গ্রুপে আপনার বিপরীত জেন্ডারের কোনো মেম্বার পাওয়া যায়নি!", threadID, messageID);
      }

      // র্যান্ডম পার্টনার সিলেক্ট
      const randomPartner = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];

      // ইমেজ অনুযায়ী: বাম পাশে মেয়ে, ডান পাশে ছেলে
      const boyID = userGender === "MALE" ? senderID : randomPartner.id;
      const girlID = userGender === "FEMALE" ? senderID : randomPartner.id;
      
      const user1Name = currentUser.name;
      const user2Name = randomPartner.name;

      // ইমেজ ডাউনলোড বাফার প্রসেস (1000012645.jpg)
      const bgResponse = await axios.get("https://i.ibb.co/qhDCvKX/1000012645.jpg", { responseType: "arraybuffer" });
      const background = await loadImage(Buffer.from(bgResponse.data));

      const tokenStr = "access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const avatarBoyUrl = `https://graph.facebook.com/${boyID}/picture?width=720&height=720&${tokenStr}`;
      const avatarGirlUrl = `https://graph.facebook.com/${girlID}/picture?width=720&height=720&${tokenStr}`;

      const boyResponse = await axios.get(avatarBoyUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.ibb.co/dmw630v/avatar.png", { responseType: "arraybuffer" }));
      const girlResponse = await axios.get(avatarGirlUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.ibb.co/dmw630v/avatar.png", { responseType: "arraybuffer" }));

      const boyImg = await loadImage(Buffer.from(boyResponse.data));
      const girlImg = await loadImage(Buffer.from(girlResponse.data));

      // ২. ক্যানভাস সাইজ ১০৮০x১০৮০ ফিক্সড (যাতে ইমেজ কোয়ালিটি আল্ট্রা এইচডি আসে)
      const canvas = createCanvas(1080, 1080);
      const ctx = canvas.getContext("2d");
      
      // হাই-কোয়ালিটি ইমেজ স্মুথিং ফিল্টার অন
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      // ব্যাকগ্রাউন্ড পুরো ক্যানভাসে স্ট্রেচ করা
      ctx.drawImage(background, 0, 0, 1080, 1080);

      // ৩. ১০৮০x১০৮০ গ্রিড অনুযায়ী ডানপাশের ছেলের মুখের নিখুঁত পজিশন
      const bSize = 240;
      const bx = 430;
      const by = 240;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + bSize / 2, by + bSize / 2, bSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(boyImg, bx, by, bSize, bSize);
      ctx.restore();

      // ৪. ১০৮০x১০৮০ গ্রিড অনুযায়ী বামপাশের মেয়ের মুখের নিখুঁত পজিশন
      const gSize = 240;
      const gx = 130;
      const gy = 380;

      ctx.save();
      ctx.beginPath();
      ctx.arc(gx + gSize / 2, gy + gSize / 2, gSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(girlImg, gx, gy, gSize, gSize);
      ctx.restore();

      // ক্যাশ ফাইল তৈরি
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const outputPath = path.join(cacheDir, `pair3_${senderID}_${Date.now()}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        // ব্যালেন্স মাইনাস
        await usersData.set(senderID, { money: currentBalance - cost });

        // কাস্টম ক্যাপশন স্টাইল
        const lovePercentage = Math.floor(Math.random() * 100) + 1; 
        
        const caption = `🥰 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n` +
                        `• ${user1Name}💙\n` +
                        `• ${user2Name}\n` +
                        `💌 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${lovePercentage}%`;

        api.sendMessage(
          {
            body: caption,
            mentions: [
              { tag: user1Name, id: senderID },
              { tag: user2Name, id: randomPartner.id }
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
