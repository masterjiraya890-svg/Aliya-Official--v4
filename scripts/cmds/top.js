const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

function shortName(name, maxLength = 18) {
  if (!name) return "Regular User";
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
}

function formatMoney(amount) {
  if (amount < 1000) return "$" + amount;
  if (amount < 1000000) return "$" + (amount / 1000).toFixed(2) + "K";
  if (amount < 1000000000) return "$" + (amount / 1000000).toFixed(2) + "M";
  if (amount < 1000000000000) return "$" + (amount / 1000000000).toFixed(2) + "B";
  return "$" + (amount / 1000000000000).toFixed(2) + "T";
}

module.exports = {
  config: {
    name: "top",
    aliases: ["leaderboard", "rich"],
    version: "2.1.0",
    author: "Mr. King",
    role: 0,
    cooldown: 30, // 30 seconds cooldown
    shortDescription: "Visual Top 15 Richest Users on Itachi Background",
    longDescription: "Fetches economy balances and renders the top 15 users as a picture on an Itachi background.",
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, messageID, usersData }) {
    const { threadID } = event;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `top_${Date.now()}.png`);
    await fs.ensureDir(cacheDir);

    try {
      const allUsers = await usersData.getAll();
      if (!allUsers || allUsers.length === 0) {
        return api.sendMessage("❌ | NO USER DATA FOUND IN DATABASE!", threadID, messageID);
      }

      const sortedUsers = allUsers
        .map(u => ({
          id: u.userID,
          name: u.name || "Facebook User",
          money: parseInt(u.money || 0, 10)
        }))
        .sort((a, b) => b.money - a.money)
        .slice(0, 15);

      const width = 1200;
      const height = 1800;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // 1. Itachi Background Image Load
      const bgUrl = "https://lh3.googleusercontent.com/d/1xJse_WHLrgUDfKUVUZfAvE3EctB40QZx";
      try {
        const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
        const bgImg = await loadImage(bgBuffer);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch (e) {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, width, height);
      }

      // 2. 50% Transparent Black Layer on top of image
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);

      // 3. Header Text
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 70px Arial";
      ctx.shadowColor = "#ff00d4";
      ctx.shadowBlur = 20;
      ctx.fillText("TOP BALANCE", width / 2, 100);
      
      ctx.fillStyle = "#ffccff";
      ctx.font = "30px Arial";
      ctx.shadowBlur = 10;
      ctx.fillText("THE RICHEST PLAYERS IN THE ECONOMY", width / 2, 150);
      ctx.shadowBlur = 0;

      // 4. Neon Glow Circle Border Function
      const drawNeonCircle = (x, y, radius, color) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();
      };

      // 5. Drawing Top Users (Podium)
      const drawTopUser = async (user, x, y, radius, borderColor, rank, moneyColor) => {
        const avtUrl = `https://graph.facebook.com/${user.id}/picture?width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        try {
          const avtData = (await axios.get(avtUrl, { responseType: "arraybuffer", timeout: 8000 })).data;
          const circleAvtBuffer = await sharp(avtData)
            .resize(radius * 2, radius * 2)
            .composite([{
              input: Buffer.from(`<svg><circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/></svg>`),
              blend: 'dest-in'
            }])
            .png()
            .toBuffer();
          const avtImg = await loadImage(circleAvtBuffer);
          ctx.drawImage(avtImg, x - radius, y - radius, radius * 2, radius * 2);
        } catch (e) {
          ctx.fillStyle = "#222222";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        drawNeonCircle(x, y, radius, borderColor);

        // Badge (#1, #2, #3)
        const badgeRadius = 35;
        const badgeX = x + radius - 20;
        const badgeY = y - radius + 20;
        
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = borderColor;
        ctx.font = "bold 35px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`#${rank}`, badgeX, badgeY + 12);

        // Name and Balance
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px Arial";
        ctx.fillText(shortName(user.name), x, y + radius + 55);

        ctx.fillStyle = moneyColor;
        ctx.font = "bold 32px Arial";
        ctx.fillText(formatMoney(user.money), x, y + radius + 95);
      };

      // 6. Positions 1, 2, and 3
      if (sortedUsers[0]) await drawTopUser(sortedUsers[0], 600, 380, 140, "#ffd700", "1", "#ffcc00");
      if (sortedUsers[1]) await drawTopUser(sortedUsers[1], 280, 410, 110, "#00f0ff", "2", "#ccffff");
      if (sortedUsers[2]) await drawTopUser(sortedUsers[2], 920, 410, 110, "#00f0ff", "3", "#ccffff");

      // 7. List for Positions 4 to 15 (Box Style)
      ctx.textAlign = "left";
      const startX = 100;
      const startY = 730;
      const rowHeight = 82;

      for (let i = 3; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        const row = i - 3;
        const currentY = startY + (row * rowHeight);

        // Transparent Bar Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(startX, currentY, width - (startX * 2), 65);

        // Side Neon Stripe
        ctx.save();
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(startX, currentY + 8);
        ctx.lineTo(startX, currentY + 57);
        ctx.stroke();
        ctx.restore();

        // Rank and Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.fillText(`#${i + 1}`, startX + 30, currentY + 43);

        ctx.fillStyle = "#ffccff";
        ctx.fillText(shortName(user.name, 25), startX + 120, currentY + 43);

        // Balance
        ctx.textAlign = "right";
        ctx.fillStyle = "#00f0ff";
        ctx.fillText(formatMoney(user.money), width - startX - 30, currentY + 43);
        ctx.textAlign = "left";
      }

      // 8. Group Name at bottom
      let threadName = "GLOBAL LEADERBOARD";
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        if (threadInfo && threadInfo.threadName) threadName = threadInfo.threadName;
      } catch (e) {}

      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 35px Arial";
      ctx.fillText(threadName.toUpperCase(), width / 2, height - 40);

      // 9. Save and Send Image
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      return api.sendMessage({
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

