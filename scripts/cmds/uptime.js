const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BG_IMAGE_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT89v3mheSHhfke_NTry7pwnZKDTRdZDbpMMxBSuBtDxw&s=10";

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "status"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 0,
    shortDescription: "Check bot uptime status card",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ api, message, event, threadsData }) {
    const threadID = event.threadID;
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const imagePath = path.join(cacheDir, `uptime_${Date.now()}.png`);

    try {
      const startTime = Date.now();

      // Fetch Thread/Group Data
      const threadInfo = await threadsData.get(threadID) || {};
      const groupName = threadInfo.threadName || "Private Chat / Direct Message";

      const ping = Date.now() - startTime;
      const uptime = Math.floor(process.uptime());

      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;

      const upTimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // Download background image buffer
      const response = await axios.get(BG_IMAGE_URL, { responseType: "arraybuffer" });
      const bgImg = await loadImage(Buffer.from(response.data, "binary"));

      // Canvas setup
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      // Draw Background Image
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Dark Overlay Layer for smooth text readability
      ctx.fillStyle = "rgba(10, 10, 20, 0.65)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glassmorphism Card Container
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(40, 40, 920, 420, 20);
      ctx.fill();
      ctx.stroke();

      // Title Section
      ctx.fillStyle = "#00F0FF";
      ctx.font = "bold 45px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("🌸 ALIYA v4 SYSTEM STATUS", 80, 70);

      // Divider Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 130);
      ctx.lineTo(920, 130);
      ctx.stroke();

      // Group Name
      ctx.fillStyle = "#FFB6C1";
      ctx.font = "bold 28px Arial";
      const displayGroupName = groupName.length > 35 ? groupName.substring(0, 35) + "..." : groupName;
      ctx.fillText(`🏠 Group Name : ${displayGroupName}`, 80, 160);

      // Uptime Text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 32px Arial";
      ctx.fillText(`⏱️ Uptime : ${upTimeStr}`, 80, 220);

      // Ping
      ctx.fillStyle = "#76BA1B";
      ctx.fillText(`⚡ Ping : ${ping} ms`, 80, 275);

      // Bot Status
      ctx.fillStyle = "#00FF7F";
      ctx.fillText(`🟢 Status : ACTIVE & READY`, 80, 330);

      // Owner & Maintainer Info
      ctx.fillStyle = "#E0E0E0";
      ctx.font = "bold 26px Arial";
      ctx.fillText(`👑 Developer : Mr.king`, 80, 390);

      // Save canvas buffer
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      // Send Response
      const captionText = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 System Status ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ Group : ${groupName}
ᥫ᭡ Uptime : ${upTimeStr}
ᥫ᭡ Ping : ${ping}ms
ᥫ᭡ Maintainer : Mr.king ☠️✌🏼`;

      await message.reply({
        body: captionText,
        attachment: fs.createReadStream(imagePath)
      });

    } catch (err) {
      console.error("Uptime command error:", err);
      return message.reply("❌ Error generating uptime status card!");
    } finally {
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {}
      }
    }
  }
};
    
