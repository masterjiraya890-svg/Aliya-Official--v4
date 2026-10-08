const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BG_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpzvbL-FM6qgkGAWe7hrhd0GGQI3-8PrAnEkjUik2Ydw&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQotMAxBFKDepv36xyBw1xpahxKpgpKfzYTbOJpSpKcyw&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKSVhY3bh50RB_PEujW0jXSX74boc0EMaYwujyH2rd9Q&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVvI8yGj1GuYd7AQ_ZXhV4V5ohL2KfeUDQiFQu79lAsA&s=10"
];

module.exports = {
  config: {
    name: "prefix",
    aliases: ["setprefix", "changeprefix"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 1,
    shortDescription: "Change or reset group prefix",
    category: "system",
    guide: "{pn} <new prefix> or {pn} reset"
  },

  onStart: async function ({ api, message, event, args, threadsData, prefix }) {
    const { threadID, senderID } = event;
    const input = args.join(" ").trim();

    if (!input) {
      return message.reply(`📌 Current Prefix: [ ${prefix} ]\n👉 Type "${prefix}prefix <new prefix>" or "${prefix}prefix reset" to change.`);
    }

    const defaultPrefix = global.GoatBot?.config?.prefix || "!";
    const isReset = input.toLowerCase() === "reset";
    const targetPrefix = isReset ? defaultPrefix : input;

    if (!isReset && targetPrefix === prefix) {
      return message.reply(`❌ Prefix is already [ ${prefix} ]`);
    }

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);
    const imagePath = path.join(cacheDir, `prefix_${Date.now()}.png`);

    try {
      const threadInfo = await threadsData.get(threadID) || {};
      const groupName = threadInfo.threadName || "Private Chat / Direct Message";

      const randomBgUrl = BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)];
      const response = await axios.get(randomBgUrl, { responseType: "arraybuffer" });
      const bgImg = await loadImage(Buffer.from(response.data, "binary"));

      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(10, 10, 20, 0.70)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(40, 40, 920, 420, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#00F0FF";
      ctx.font = "bold 42px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("⚙️ PREFIX CHANGE SYSTEM", 80, 70);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 130);
      ctx.lineTo(920, 130);
      ctx.stroke();

      ctx.fillStyle = "#FFB6C1";
      ctx.font = "bold 28px Arial";
      const displayGroupName = groupName.length > 35 ? groupName.substring(0, 35) + "..." : groupName;
      ctx.fillText(`🏠 Group : ${displayGroupName}`, 80, 160);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 32px Arial";
      ctx.fillText(`📌 Current Prefix : [ ${prefix} ]`, 80, 230);

      ctx.fillStyle = "#00FF7F";
      ctx.fillText(`✨ Target Prefix  : [ ${targetPrefix} ]`, 80, 290);

      ctx.fillStyle = "#E0E0E0";
      ctx.font = "bold 24px Arial";
      ctx.fillText(`⚠️ React with any emoji to confirm change!`, 80, 370);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      const captionText = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Prefix System ── ✧🌸𓍢ִ໋🌷͙֒

ᥫ᭡ Group : ${groupName}
ᥫ᭡ Current Prefix : [ ${prefix} ]
ᥫ᭡ New Prefix : [ ${targetPrefix} ]

👉 Please react to this message to confirm changing prefix!`;

      const info = await message.reply({
        body: captionText,
        attachment: fs.createReadStream(imagePath)
      });

      global.GoatBot.onReaction.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: senderID,
        targetPrefix
      });

    } catch (err) {
      console.error("Prefix command error:", err);
      return message.reply("❌ Error generating prefix card!");
    } finally {
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {}
      }
    }
  },

  onReaction: async function ({ api, event, Reaction, threadsData, message }) {
    const { author, targetPrefix } = Reaction;
    const { userID, threadID, messageID } = event;

    if (userID !== author) return;

    try {
      await threadsData.set(threadID, {
        prefix: targetPrefix
      });

      if (global.db && global.db.allThreadData) {
        const threadData = global.db.allThreadData.find(t => t.threadID == threadID);
        if (threadData) {
          threadData.prefix = targetPrefix;
        }
      }

      await message.reply(`✅ Prefix has been successfully changed to: [ ${targetPrefix} ]`);
      api.unsendMessage(messageID);
    } catch (err) {
      console.error("Prefix Reaction Error:", err);
      return message.reply("❌ Failed to change prefix!");
    }
  }
};
      
