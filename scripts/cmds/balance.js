module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "1.4.0",
    author: "Mr.King ",
    countDown: 5,
    role: 0,
    category: "economy",
    shortDescription: { en: "Check wallet balance with compact format" },
    guide: { en: "{pn} | {pn} @mention | reply to a message" }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, mentions, messageReply, senderID } = event;

    let targetID = senderID;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    try {
      const userData = await usersData.get(targetID);
      const name = userData.name || "Pookie User";
      const rawBalance = userData.money || 0;

      function formatEconomy(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
        if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
        return num.toString();
      }

      const formattedBalance = formatEconomy(rawBalance);

      const pookieCard = 
        `🌸 ─── 🌺 𝑷𝑶𝑶𝑲𝑰𝑬 𝑾𝑨𝑳𝑳𝑬𝑻 🌺 ─── 🌸\n` +
        `╭────────────────────────⬣\n` +
        `│ 🌷 𝐍𝐚𝐦𝐞 : ${name}\n` +
        `│ 🎀 ${name}'𝐬 𝐖𝐚𝐥𝐥𝐞𝐭 : ${formattedBalance} Coins 🪙\n` +
        `│ 🧸 𝐒𝐭𝐚𝐭𝐮𝐬 : Cutest Pookie ✨\n` +
        `╰────────────────────────⬣\n` +
        `🌸━━━ 𝐌𝐚𝐝𝐞 𝐰𝐢𝐭𝐡 💖 𝐛𝐲 𝐌𝐫.𝐊𝐢𝐧𝐠 ━━━🌸`;

      return api.sendMessage(pookieCard, threadID, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error fetching balance from database.", threadID, messageID);
    }
  }
};
