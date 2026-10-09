const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

function cleanName(name) {
  if (!name) return "Facebook User";
  let cleaned = name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
  cleaned = cleaned.normalize("NFKD");
  cleaned = cleaned.replace(/[^\x20-\x7E\u0980-\u09FF]/g, '').trim();
  return cleaned.length === 0 ? "Regular User" : cleaned;
}

function formatTextLeaderboard(arraySort, totalMessages, page, totalPages) {
  let textMsg = `📊 ══ [ 𝐀𝐋𝐈𝐘𝐀 𝐒𝐘𝐒𝐓𝐄𝐌 ] ══ 📊\n`;
  textMsg += `✨ 𝐆𝐑𝐎𝐔𝐏 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 ✨\n`;
  textMsg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  textMsg += `📖 𝐏𝐚𝐠𝐞: ${page}/${totalPages} | 💬 𝐓𝐨𝐭𝐚𝐥 𝐌𝐬𝐠𝐬: ${totalMessages.toLocaleString()}\n`;
  textMsg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const item of arraySort) {
    const formattedNum = item.stt < 10 ? '0' + item.stt : item.stt;
    let badge = `[#${formattedNum}]`;
    if (item.stt === 1) badge = "🥇 [#01]";
    else if (item.stt === 2) badge = "🥈 [#02]";
    else if (item.stt === 3) badge = "🥉 [#03]";

    textMsg += `${badge} ${cleanName(item.name)}\n   └─ 💬 ${item.count.toLocaleString()} msgs\n`;
  }

  textMsg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
  textMsg += `💡 Reply with a page number (1-${totalPages}) to jump.\n`;
  textMsg += `⚙️ 𝐀𝐥𝐢𝐲𝐚 𝐒𝐲𝐬𝐭𝐞𝐦 • 𝐀𝐥𝐥 𝐑𝐢𝐠𝐡𝐭𝐬 𝐑𝐞𝐬𝐞𝐫𝐯𝐞𝐝`;
  return textMsg;
}

async function renderLeaderboardImage(topList, totalMessages, page, totalPages) {
  const width = 1200;
  const height = 1500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Load custom background image
  const bgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUNGlE3waNRvMoXBQsSbNSo-_uoKXk2jguPC3syDJprbUD185WhwpqNkU2&s=10";
  try {
    const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer", timeout: 8000 })).data;
    const bgImg = await loadImage(bgBuffer);
    ctx.drawImage(bgImg, 0, 0, width, height);
  } catch (e) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#080614");
    gradient.addColorStop(0.5, "#0d0a26");
    gradient.addColorStop(1, "#05030a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // 50% Semi-transparent dark overlay for background visibility
  ctx.fillStyle = "rgba(10, 8, 20, 0.65)";
  ctx.fillRect(0, 0, width, height);

  // Outer Neon Glow Border
  ctx.strokeStyle = "#a855f7";
  ctx.shadowColor = "#c084fc";
  ctx.shadowBlur = 15;
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);
  ctx.shadowBlur = 0;

  // Header System Name (Aliya System)
  ctx.fillStyle = "#e879f9";
  ctx.font = "bold 32px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "#f43f5e";
  ctx.shadowBlur = 10;
  ctx.fillText("❖ 𝐀𝐋𝐈𝐘𝐀 𝐒𝐘𝐒𝐓𝐄𝐌 ❖", width / 2, 80);

  // Header Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 50px Arial, sans-serif";
  ctx.shadowColor = "#c084fc";
  ctx.shadowBlur = 18;
  ctx.fillText("MESSAGE LEADERBOARD", width / 2, 135);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText(`Page ${page}/${totalPages}  •  Total Messages: ${totalMessages.toLocaleString()}`, width / 2, 180);

  // Divider Line
  ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 210);
  ctx.lineTo(width - 60, 210);
  ctx.stroke();

  // List Rows
  const startX = 80;
  const startY = 250;
  const rowHeight = 88;

  for (let index = 0; index < topList.length; index++) {
    const item = topList[index];
    const y = startY + index * rowHeight;

    // Row Background Box
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(startX, y, width - (startX * 2), 70);

    const formattedNum = item.stt < 10 ? '0' + item.stt : item.stt;
    let rankText = `#${formattedNum}`;
    let rankColor = "#94a3b8";

    if (item.stt === 1) {
      rankText = "🥇 #01";
      rankColor = "#fbbf24";
    } else if (item.stt === 2) {
      rankText = "🥈 #02";
      rankColor = "#e2e8f0";
    } else if (item.stt === 3) {
      rankText = "🥉 #03";
      rankColor = "#f97316";
    }

    // Rank Text
    ctx.textAlign = "left";
    ctx.fillStyle = rankColor;
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.fillText(rankText, startX + 25, y + 45);

    // Profile Avatar Drawing
    const avatarX = startX + 175;
    const avatarY = y + 35;
    const avatarRadius = 26;
    const avatarUrl = `https://graph.facebook.com/${item.uid}/picture?width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    try {
      const imgData = (await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 5000 })).data;
      const img = await loadImage(imgData);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();
    } catch (e) {
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Avatar Border
    ctx.strokeStyle = rankColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Member Name
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px Arial, sans-serif";
    const displayName = cleanName(item.name);
    const truncatedName = displayName.length > 20 ? displayName.substring(0, 20) + "..." : displayName;
    ctx.fillText(truncatedName, avatarX + 45, y + 43);

    // Message Count
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillText(`${item.count.toLocaleString()} msgs`, width - startX - 25, y + 43);
  }

  // Footer
  ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, height - 110);
  ctx.lineTo(width - 60, height - 110);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText(`Reply with a number (1-${totalPages}) to jump to that page`, width / 2, height - 70);

  ctx.fillStyle = "#e879f9";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.shadowColor = "#f43f5e";
  ctx.shadowBlur = 8;
  ctx.fillText(`• 𝐀𝐥𝐢𝐲𝐚 𝐒𝐲𝐬𝐭𝐞𝐦 •`, width / 2, height - 35);
  ctx.shadowBlur = 0;

  const cachePath = path.join(__dirname, "cache", `count_${Date.now()}.png`);
  if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });

  fs.writeFileSync(cachePath, canvas.toBuffer());
  return cachePath;
}

module.exports = {
  config: {
    name: "count",
    aliases: ["c"],
    version: "3.5.0",
    author: "Mr.King / Aliya System",
    countDown: 5,
    role: 0,
    category: "box chat",
    shortDescription: "Check group message rankings with banner image",
    guide: { en: "{pn} -> Your rank | {pn} all -> Full rankings | {pn} @tag -> Tagged rank" }
  },

  onStart: async function ({ args, threadsData, message, event, api }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    const { members } = threadData;
    const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;

    let arraySort = members
      .filter(u => usersInGroup.includes(u.userID))
      .map(u => ({
        name: u.name || "Unknown",
        count: u.count || 0,
        uid: u.userID
      }))
      .sort((a, b) => b.count - a.count)
      .map((item, index) => ({ ...item, stt: index + 1 }));

    if (!args[0]) {
      const findUser = arraySort.find(item => item.uid == senderID);
      if (!findUser) return message.reply("❌ | No message data found for you yet.");
      return message.reply(`> 🌺 ( 𝐘𝐨𝐮𝐫 𝐒𝐭𝐚𝐭𝐬 )\n━━━━━━━━━━━━━━━━━━\n👑 | 𝐑𝐚𝐧𝐤: #${findUser.stt}\n💬 | 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${findUser.count}\n━━━━━━━━━━━━━━━━━━\n• 𝐀𝐥𝐢𝐲𝐚 𝐒𝐲𝐬𝐭𝐞𝐦 🌸`);
    }

    if (args[0].toLowerCase() === "all" || !isNaN(args[0])) {
      let page = parseInt(args[0]) || 1;
      const itemsPerPage = 12;
      const totalPages = Math.ceil(arraySort.length / itemsPerPage) || 1;

      if (page < 1 || page > totalPages) page = 1;

      const topList = arraySort.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      const totalMessages = arraySort.reduce((acc, cur) => acc + cur.count, 0);

      try {
        const imgPath = await renderLeaderboardImage(topList, totalMessages, page, totalPages);

        return message.reply({
          attachment: fs.createReadStream(imgPath)
        }, (err, info) => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "count",
              messageID: info.messageID,
              author: event.senderID,
              totalPages: totalPages,
              arraySort: arraySort,
              totalMessages: totalMessages
            });

            setTimeout(() => {
              if (api.unsendMessage) api.unsendMessage(info.messageID);
            }, 20000);
          }
        });
      } catch (err) {
        // Fallback to text message if image generation fails
        const textMsg = formatTextLeaderboard(topList, totalMessages, page, totalPages);
        return message.reply(textMsg, (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "count",
              messageID: info.messageID,
              author: event.senderID,
              totalPages: totalPages,
              arraySort: arraySort,
              totalMessages: totalMessages
            });

            setTimeout(() => {
              if (api.unsendMessage) api.unsendMessage(info.messageID);
            }, 20000);
          }
        });
      }
    }

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      let msg = `> 🌺 ( 𝐔𝐬𝐞𝐫 𝐒𝐭𝐚𝐭𝐬 )\n━━━━━━━━━━━━━━━━━━`;
      for (const id in event.mentions) {
        const findUser = arraySort.find(item => item.uid == id);
        if (findUser) {
          msg += `\n👤 | ${findUser.name}: Rank #${findUser.stt} (${findUser.count} msgs)`;
        }
      }
      return message.reply(msg + `\n━━━━━━━━━━━━━━━━━━\n• 𝐀𝐥𝐢𝐲𝐚 𝐒𝐲𝐬𝐭𝐞𝐦 🌸`);
    }
  },

  onReply: async function ({ api, message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const page = parseInt(event.body.trim());
    if (isNaN(page) || page < 1 || page > Reply.totalPages) return;

    const itemsPerPage = 12;
    const topList = Reply.arraySort.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    try {
      const imgPath = await renderLeaderboardImage(topList, Reply.totalMessages, page, Reply.totalPages);

      return message.reply({
        attachment: fs.createReadStream(imgPath)
      }, (err, info) => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        if (api.unsendMessage) api.unsendMessage(Reply.messageID);

        if (!err && info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "count",
            messageID: info.messageID,
            author: event.senderID,
            totalPages: Reply.totalPages,
            arraySort: Reply.arraySort,
            totalMessages: Reply.totalMessages
          });

          setTimeout(() => {
            if (api.unsendMessage) api.unsendMessage(info.messageID);
          }, 20000);
        }
      });
    } catch (err) {
      const textMsg = formatTextLeaderboard(topList, Reply.totalMessages, page, Reply.totalPages);
      return message.reply(textMsg, (err, info) => {
        if (api.unsendMessage) api.unsendMessage(Reply.messageID);

        if (!err && info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "count",
            messageID: info.messageID,
            author: event.senderID,
            totalPages: Reply.totalPages,
            arraySort: Reply.arraySort,
            totalMessages: Reply.totalMessages
          });

          setTimeout(() => {
            if (api.unsendMessage) api.unsendMessage(info.messageID);
          }, 20000);
        }
      });
    }
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    if (!senderID || !threadID) return;

    let members = await threadsData.get(threadID, "members");
    if (!members) members = [];

    const findMember = members.find(user => user.userID == senderID);
    if (!findMember) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        count: 1
      });
    } else {
      findMember.count = (findMember.count || 0) + 1;
    }
    await threadsData.set(threadID, members, "members");
  }
};
