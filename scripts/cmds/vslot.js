 module.exports = {
  config: {
    name: "vslot",
    aliases: ["vipslot", "vslotgame"],
    version: "2.0.0",
    author: "Mr.King ",
    countDown: 3,
    role: 0,
    category: "game",
    shortDescription: { en: "VIP Casino Slot Machine" },
    guide: { en: "{pn} <amount>" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    if (!args[0]) {
      return api.sendMessage("⚠️ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝖻𝖾𝗍 𝖺𝗆𝗈𝗎𝗇𝗍! 𝖤𝗑𝖺𝗆𝗉𝗅𝖾: /𝗏𝗌𝗅𝗈𝗍 100𝗄", threadID, messageID);
    }

    const MAX_BET = 100000000000000;
    const bet = parseShortAmount(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return api.sendMessage("⚠️ 𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝖻𝖾𝗍 𝖺𝗆𝗈𝗎𝗇𝗍!", threadID, messageID);
    }

    if (bet < 50) {
      return api.sendMessage("⚠️ 𝖬𝗂𝗇𝗂𝗆𝗎𝗆 𝖻𝖾𝗍 𝗂𝗌 𝟧𝟢 𝖼𝗈𝗂𝗇𝗌.", threadID, messageID);
    }

    if (bet > MAX_BET) {
      return api.sendMessage("⚠️ 𝖬𝖺𝗑𝗂𝗆𝗎𝗆 𝖻𝖾𝗍 𝗅𝗂𝗆𝗂𝗍 𝗂𝗌 𝟣𝟢𝟢𝖳 𝖼𝗈𝗂𝗇𝗌!", threadID, messageID);
    }

    const userData = await usersData.get(senderID);
    const userMoney = userData.money || 0;

    if (userMoney < bet) {
      return api.sendMessage(`❌ 𝖨𝗇𝗌𝗎𝖿𝖿𝗂𝖼𝗂𝖾𝗇𝗍 𝖻𝖺𝗅𝖺𝗇𝖼𝖾!\n💳 𝖸𝗈𝗎𝗋 𝖡𝖺𝗅𝖺𝗇𝖼𝖾: ${formatNumber(userMoney)}`, threadID, messageID);
    }

    const items = ["🎰", "💎", "👑", "7️⃣", "🔥", "⚡", "🍀"];

    const slot1 = items[Math.floor(Math.random() * items.length)];
    const slot2 = items[Math.floor(Math.random() * items.length)];
    const slot3 = items[Math.floor(Math.random() * items.length)];

    let winAmount = 0;
    let resultHeader = "";

    if (slot1 === slot2 && slot2 === slot3) {
      if (slot1 === "💎" || slot1 === "7️⃣" || slot1 === "👑") {
        winAmount = bet * 10;
        resultHeader = `👑 𝗠𝗔𝗦𝗧𝗘𝗥 𝗝𝗔𝗖𝗞𝗣𝗢𝗧! 👑\n🏆 +${formatNumber(winAmount)} 𝖼𝗈𝗂𝗇𝗌 (10𝗑)`;
      } else {
        winAmount = bet * 5;
        resultHeader = `🎉 𝗨𝗟𝗧𝗜𝗠𝗔𝗧𝗘 𝗪𝗜𝗡! 🎉\n🏆 +${formatNumber(winAmount)} 𝖼𝗈𝗂𝗇𝗌 (5𝗑)`;
      }
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      winAmount = bet * 2;
      resultHeader = `✨ 𝗟𝗨𝗖𝗞𝗬 𝗦𝗧𝗥𝗜𝗞𝗘! ✨\n🏆 +${formatNumber(winAmount)} 𝖼𝗈𝗂𝗇𝗌 (2𝗑)`;
    } else {
      winAmount = -bet;
      resultHeader = `💀 𝗕𝗔𝗗 𝗟𝗨𝗖𝗞! 💀\n💔 -${formatNumber(bet)} 𝖼𝗈𝗂𝗇𝗌`;
    }

    const newBalance = userMoney + winAmount;
    userData.money = newBalance;
    await usersData.set(senderID, userData);

    const slotCard = 
      `⚜️ ═══ ⟪ 𝗩𝗜𝗣 𝗖𝗔𝗦𝗜𝗡𝗢 ⟫ ═══ ⚜️\n` +
      `╭━━━━━━━━━━━━━━━━╮\n` +
      `│  🎰 ❭  [ ${slot1} ┊ ${slot2} ┊ ${slot3} ]  ❮ 🎰 │\n` +
      `╰━━━━━━━━━━━━━━━━╯\n` +
      `❖ ${resultHeader}\n` +
      `───────────────────────\n` +
      `💳 𝗩𝗜𝗣 𝗩𝗮𝘂𝗹𝘁 : ${formatNumber(newBalance)} 𝖼𝗈𝗂𝗇𝗌\n` +
      `──────────★──────────\n` +
      `𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 🤍 𝐛𝐲 --𝔐𝔯.𝔎𝔦𝔫𝔤`;

    return api.sendMessage(slotCard, threadID, messageID);
  }
};

function parseShortAmount(str) {
  const cleanStr = str.toLowerCase().trim();
  const matches = cleanStr.match(/^([0-9.]+)\s*([kmbt]?)$/);
  if (!matches) return NaN;
  const value = parseFloat(matches[1]);
  const suffix = matches[2];
  switch (suffix) {
    case "k": return value * 1e3;
    case "m": return value * 1e6;
    case "b": return value * 1e9;
    case "t": return value * 1e12;
    default: return value;
  }
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}
