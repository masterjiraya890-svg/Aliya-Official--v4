const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "poop",
    aliases: ["dogpoop", "hugu"],
    version: "1.3.0",
    author: "Mr.King 🎭",
    countDown: 5,
    role: 0,
    category: "troll",
    shortDescription: {
      en: "💩 Put someone's avatar on dog poop"
    },
    guide: {
      en: "{pn} @mention | {pn} (reply to a user)"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID, messageID, mentions, messageReply } = event;
    const bossID = "61590317176239"; 
    const cost = 2000; 

    const senderData = await usersData.get(senderID);
    if (senderID !== bossID) {
      const currentBalance = senderData.money || 0;
      if (currentBalance < cost) {
        const customDialog = "𝐁𝐢𝐜𝐢 𝐭𝐞 𝐧𝐚𝐢 𝐛𝐚𝐥\n𝐑𝐨𝐣 𝐫𝐚𝐭𝐞 𝐇𝐚𝐧𝐝𝐞𝐥 𝐦𝐚𝐫𝐞 𝐞𝐢 𝐚𝐛𝐚𝐥\n𝐄𝐝𝐢 𝐉𝐨𝐝𝐢 𝐮𝐬𝐞 𝐊𝐨𝐫𝐭𝐞 𝐜𝐡𝐚𝐰\n𝐒𝐥𝐨𝐭 𝐠𝐚𝐦𝐞 [ /slot ] 𝐤𝐡𝐞𝐥េ 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐤𝐚𝐦𝐚𝐰💵💲";
        return api.sendMessage(customDialog, threadID, messageID);
      }
    }

    let targetID = null;
    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else {
      return api.sendMessage("⚠️ কাউরে তো মেনশন করবি বা তার মেসেজে রিপ্লাই দিবি! কারে গু বানাবি?", threadID, messageID);
    }

    try {
      api.setMessageReaction("💩", messageID, (err) => {}, true);

      // ডিরেক্ট লিঙ্ক ক্র্যাশ এড়াতে বাফার দিয়ে ইমেজ লোড করার সিস্টেম
      const bgResponse = await axios.get("https://i.ibb.co.com/MDsMXbWR/image.png", { responseType: "arraybuffer" });
      const background = await loadImage(Buffer.from(bgResponse.data));

      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarImg = await loadImage(Buffer.from(avatarResponse.data));

      const canvas = createCanvas(450, 450);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(background, 0, 0, 450, 450);

      // কুকুরের পোপ এরিয়া অনুযায়ী নিখুঁত পজিশন
      const size = 58;  
      const x = 122;    
      const y = 322;    

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const outputPath = path.join(cacheDir, `poop_${targetID}.png`);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", async () => {
        if (senderID !== bossID) {
          const currentBalance = senderData.money || 0;
          await usersData.set(senderID, { money: currentBalance - cost });
        }

        const successBody = `ঐ দেখ তোর গু-এর দলা! 😂💩\n\n🦭 𝐒𝐲𝐬𝐭𝐞𝐦 𝐁𝐲: 𝐌𝐫.𝐊𝐢𝐧𝐠 🕊️💖`;

        api.sendMessage(
          {
            body: successBody,
            attachment: fs.createReadStream(outputPath)
          },
          threadID,
          () => {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          },
          messageID
        );
      });

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ কুত্তা হাগু করতে গিয়ে প্যান্ট নষ্ট করে ফেলছে! (সার্ভার এরর)", threadID, messageID);
    }
  }
};
