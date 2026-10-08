const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "takla",
    aliases: ["bald", "murad"],
    version: "1.0.5",
    author: "Mr. King",
    role: 0,
    cooldown: 5,
    shortDescription: "Takla Murad meme with profile picture overlay on face",
    longDescription: "Crops target profile picture directly over Takla Murad's face while keeping the bald head visible, supporting reply, mention, and random group member targeting.",
    category: "fun",
    guide: { en: "{pn} or {pn} @mention or reply to message" }
  },

  onStart: async function ({ api, event, messageID, usersData }) {
    const { threadID, senderID, mentions, messageReply } = event;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `takla_${Date.now()}.png`);
    await fs.ensureDir(cacheDir);

    // React with 🧑‍🦲 on trigger
    api.setMessageReaction("🧑‍🦲", messageID, (err) => {}, true);

    // Target Selection: Mention -> Reply -> Random Group Member
    let targetID = senderID;
    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const participantIDs = threadInfo.participantIDs || [];
        if (participantIDs.length > 0) {
          targetID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
        }
      } catch (e) {
        targetID = senderID;
      }
    }

    // 5 Random Funny Meme Captions
    const memeMessages = [
      "মাথায় চুল নাই দেইখা কষ্ট পাইয়েন না, তেল বাচতেসে তো! 👨‍🦲✨",
      "টকলা মাথার পাওয়ার বুঝবেন না, রাতে লাইট লাগায় ঘোরা লাগে না! 💡🤣",
      "মাথা তো নয় যেন একখানা চকচকে আয়না! 🪞🫣",
      "চুল পইড়া গেছে বলে কি হ্যান্ডসাম হওয়া আটকায় নাকি? 🕶️🔥",
      "আপনার মাথায় মাছি বসলে তো পিছলা খাইয়া পইড়া যাবে! 🪰💨"
    ];

    const randomMsg = memeMessages[Math.floor(Math.random() * memeMessages.length)];

    try {
      // Base Takla Image URL
      const baseImgUrl = "https://i.imgur.com/KsvAWCv.jpeg";
      const baseResponse = await axios.get(baseImgUrl, { 
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      const baseImg = await loadImage(Buffer.from(baseResponse.data, "binary"));

      const width = baseImg.width;
      const height = baseImg.height;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw Base Image
      ctx.drawImage(baseImg, 0, 0, width, height);

      // Token-less Profile Picture Fetching with Fallbacks
      let avtBuffer = null;
      const avatarSources = [];

      if (usersData && typeof usersData.getAvatarUrl === "function") {
        try {
          const goatAvatar = await usersData.getAvatarUrl(targetID);
          if (goatAvatar) avatarSources.push(goatAvatar);
        } catch (e) {}
      }

      avatarSources.push(`https://www.facebook.com/p/a/${targetID}`);
      avatarSources.push(`https://unavatar.io/facebook/${targetID}`);
      avatarSources.push(`https://graph.facebook.com/${targetID}/picture?type=large`);

      for (const url of avatarSources) {
        try {
          const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 8000,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
            }
          });
          if (res.data && res.data.byteLength > 500) {
            avtBuffer = Buffer.from(res.data, "binary");
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!avtBuffer) {
        api.setMessageReaction("❌", messageID, (err) => {}, true);
        return api.sendMessage("❌ User-er Profile Picture load kora jayni!", threadID, messageID);
      }

      // Precise Face Position (Covers face area; leaves top bald head visible)
      const faceX = 310;
      const faceY = 280;
      const faceRadius = 110;

      // Crop Avatar into Circle
      const croppedAvt = await sharp(avtBuffer)
        .resize(faceRadius * 2, faceRadius * 2)
        .composite([{
          input: Buffer.from(`<svg><circle cx="${faceRadius}" cy="${faceRadius}" r="${faceRadius}" fill="black"/></svg>`),
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      const userFaceImg = await loadImage(croppedAvt);

      // Draw Profile Picture over Face Area
      ctx.drawImage(userFaceImg, faceX - faceRadius, faceY - faceRadius, faceRadius * 2, faceRadius * 2);

      // Save Image and Send
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      return api.sendMessage({
        body: randomMsg,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (global.gc) global.gc();
      }, messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      return api.sendMessage(`❌ | Error generating takla meme: ${error.message}`, threadID, messageID);
    }
  }
};

