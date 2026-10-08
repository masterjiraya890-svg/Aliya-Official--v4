const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "patkhet",
    aliases: ["patkhete"],
    version: "1.0.5",
    author: "Mr. King",
    role: 0,
    cooldown: 5,
    shortDescription: "Patkhet doge image overlay with user profile pic on left side",
    longDescription: "Overlay user profile picture on the left side of the patkhet image with a funny caption.",
    category: "fun",
    guide: { en: "{pn} or {pn} @mention or reply to message" }
  },

  onStart: async function ({ api, event, messageID, usersData }) {
    const { threadID, senderID, mentions, messageReply } = event;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `patkhet_${Date.now()}.png`);
    await fs.ensureDir(cacheDir);

    let targetID = senderID;
    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    try {
      // 1. Load Background Image
      const baseImgUrl = "https://i.imgur.com/aepcaMC.png";
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

      ctx.drawImage(baseImg, 0, 0, width, height);

      // 2. Profile Picture Fetcher with Multiple Safe Fallbacks
      let avtBuffer = null;
      const avatarSources = [];

      // GoatBot UserData Avatar Check
      if (usersData && typeof usersData.getAvatarUrl === "function") {
        try {
          const goatAvatar = await usersData.getAvatarUrl(targetID);
          if (goatAvatar) avatarSources.push(goatAvatar);
        } catch (e) {}
      }

      // Public Unavatar & Facebook Direct CDN (No token needed)
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
        return api.sendMessage("❌ User-er Profile Picture load kora jayni!", threadID, messageID);
      }

      const faceRadius = Math.floor(height * 0.18); // Circle radius relative to image height
      const faceX = Math.floor(width * 0.25);        // Center position on Left side
      const faceY = Math.floor(height * 0.55);       // Middle height area

      const croppedAvt = await sharp(avtBuffer)
        .resize(faceRadius * 2, faceRadius * 2)
        .composite([{
          input: Buffer.from(`<svg><circle cx="${faceRadius}" cy="${faceRadius}" r="${faceRadius}" fill="black"/></svg>`),
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      const userFaceImg = await loadImage(croppedAvt);

      ctx.drawImage(userFaceImg, faceX - faceRadius, faceY - faceRadius, faceRadius * 2, faceRadius * 2);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const msgText = "Akon vor bela patkhete k aibo\nJai aro vitore dukhe Handel Mari 🦆💨";

      return api.sendMessage({
        body: msgText,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (global.gc) global.gc();
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`❌ | Error: ${error.message}`, threadID, messageID);
    }
  }
};

