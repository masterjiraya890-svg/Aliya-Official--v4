// Banner Image: https://files.catbox.moe/ixj7u8.jpg

const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    version: "2.0.0",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    countDown: 10,
    role: 0,
    category: "love",
    guide: { en: "{p}pair2" }
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

      // যে ইউজার কমান্ড রান করেছে তার ডাটা
      const currentUser = userInfo.find(u => u.id === senderID);
      if (!currentUser || !currentUser.gender) {
        return api.sendMessage("⚠️ আপনার প্রোফাইলে জেন্ডার সেট করা নেই!", threadID, messageID);
      }

      const userGender = currentUser.gender.toUpperCase();
      let matchCandidates = [];

      // ২. অপোজিট জেন্ডার ফিল্টারিং লজিক (ইউজার নিজে বাদ যাবে)
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

      // রেনডম পার্টনার সিলেক্ট
      const randomPartner = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];

      // জেন্ডার অনুযায়ী ছবিতে পজিশন ঠিক করা (বাম পাশে ছেলে, ডান পাশে মেয়ে)
      const boyID = userGender === "MALE" ? senderID : randomPartner.id;
      const girlID = userGender === "FEMALE" ? senderID : randomPartner.id;
      
      const boyName = userGender === "MALE" ? currentUser.name : randomPartner.name;
      const girlName = userGender === "FEMALE" ? currentUser.name : randomPartner.name;

      // ৩. হাই-কোয়ালিটি ইমেজ ডাউনলোড (720x720) এবং টোকেন মেথড
      const bgResponse = await axios.get("https://i.ibb.co/JFnQkzvk/1000012646.jpg", { responseType: "arraybuffer" });
      const background = await loadImage(Buffer.from(bgResponse.data));

      const tokenStr = "access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const avatarBoyUrl = `https://graph.facebook.com/${boyID}/picture?width=720&height=720&${tokenStr}`;
      const avatarGirlUrl = `https://graph.facebook.com/${girlID}/picture?width=720&height=720&${tokenStr}`;

      const boyResponse = await axios.get(avatarBoyUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.ibb.co/dmw630v/avatar.png", { responseType: "arraybuffer" }));
      const girlResponse = await axios.get(avatarGirlUrl, { responseType: "arraybuffer" }).catch(() => axios.get("https://i.ibb.co/dmw630v/avatar.png", { responseType: "arraybuffer" }));

      const boyImg = await loadImage(Buffer.from(boyResponse.data));
      const girlImg = await loadImage(Buffer.from(girlResponse.data));

      // ৪. হাই-ডেফিনিশন ক্যানভাস কোয়ালিটি প্রোটেকশন
      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");
      
      // ইমেজ স্মুথিং এনাবল করা (কোয়ালিটি ফিক্স)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      ctx.drawImage(background, 0, 0, background.width, background.height);

      // ছেলের ছবি নিখুঁত পজিশন (Size: 22%)
      const bSize = Math.floor(background.width * 0.22);
      const bx = Math.floor(background.width * 0.23);
      const by = Math.floor(background.height * 0.16);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + bSize / 2, by + bSize / 2, bSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(boyImg, bx, by, bSize, bSize);
      ctx.restore();

      // মেয়ের ছবি নিখুঁত পজিশন (Size: 22%)
      const gSize = Math.floor(background.width * 0.22);
      const gx = Math.floor(background.width * 0.44);
      const gy = Math.floor(background.height * 0.26);

      ctx.save();
      ctx.beginPath();
      ctx.arc(gx + gSize / 2, gy + gSize / 2, gSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(girlImg, gx, gy, gSize, gSize);
      ctx.restore();

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const outputPath = path.join(cacheDir, `pair_${senderID}_${Date.now()}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        // ১০কে ব্যালেন্স মাইনাস
        await usersData.set(senderID, { money: currentBalance - cost });

        // ৫. স্টাইলিশ গড-লেভেল অরা ক্যাপশন স্টাইল
        const lovePercentage = Math.floor(Math.random() * 41) + 60; // ৬০% থেকে ১০০% এর মধ্যে লাভ রেট
        
        const caption = `╭──────📦 𝐏𝐄𝐑𝐅𝐄𝐂𝐓 𝐌𝐀𝐓𝐂𝐇 📦──────╮\n\n` +
                        `  🤵 𝐁𝐨𝐲: ${boyName}\n` +
                        `  👰 𝐆𝐢𝐫𝐥: ${girlName}\n\n` +
                        `  💞 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: 【 ${lovePercentage}% 】\n\n` +
                        `╰────────────────────────╯\n` +
                        `"নিয়তি আজ তোমাদের দুজনকে একসাথে মিলিয়ে দিলো। তোমরা যেন সারাজীবন এভাবেই একে অপরের পাশে থাকতে পারো! 💖"`;

        api.sendMessage(
          {
            body: caption,
            mentions: [
              { tag: currentUser.name, id: senderID },
              { tag: randomPartner.name, id: randomPartner.id }
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
      return api.sendMessage("❌ সার্ভার এরর! দয়া করে আবার চেষ্টা করুন।", threadID, messageID);
    }
  }
};
