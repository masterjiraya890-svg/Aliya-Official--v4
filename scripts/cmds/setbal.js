const axios = require("axios");

const makeBold = (text) => {
  if (!text) return "";
  const fonts = {
    a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦",
    n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
    A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌",
    N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
    "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
  };
  return text.split("").map(char => fonts[char] || char).join("");
};

module.exports = {
  config: {
    name: "setbal",
    aliases: ["setmoney", "sb"],
    version: "1.0.0",
    author: "Mr.King 🎭",
    countDown: 2,
    role: 2,
    category: "admin",
    guide: {
      en: "{pn} [amount] (reply) | {pn} @mention [amount] | {pn} [UID] [amount]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let targetID = null;
    let amount = null;

    if (messageReply) {
      targetID = messageReply.senderID;
      amount = parseInt(args[0]);
    }
    else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      amount = parseInt(args.join(" ").replace(/@[^]*?(\s|$)/, "").trim());
    }
    else if (args.length > 0) {
      if (args.length === 1) {
        targetID = senderID;
        amount = parseInt(args[0]);
      } else if (args.length >= 2) {
        targetID = args[0];
        amount = parseInt(args[1]);
      }
    }

    if (!targetID || isNaN(amount)) {
      return api.sendMessage(makeBold("⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐅𝐨𝐫𝐦𝐚𝐭!\n𝐔𝐬𝐞: /setbal [amount] (reply) | /setbal @mention [amount] | /setbal [UID] [amount]"), threadID, messageID);
    }

    try {
      await usersData.set(targetID, { money: amount });
      const name = await usersData.getName(targetID);

      const successText = `✅ 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 𝐒𝐞𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n\n👤 𝐔𝐬𝐞𝐫: ${name}\n🆔 𝐔🇮🇩: ${targetID}\n💰 𝐍𝐞𝐰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${amount.toLocaleString()}৳\n\n👑 𝐒𝐲𝐬𝐭𝐞𝐦 𝐁𝐲: 𝐌𝐫.𝐊𝐢𝐧𝐠 🕊️💖`;

      const videoUrls = [
        "https://files.catbox.moe/st1fzf.mp4",
        "https://files.catbox.moe/gdb4xi.mp4"
      ];
      const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];

      try {
        const stream = await global.utils.getStreamFromURL(randomVideo);
        return api.sendMessage({
          body: successText,
          attachment: [stream]
        }, threadID, messageID);
      } catch (videoError) {
        return api.sendMessage(successText, threadID, messageID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage(makeBold("❌ 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞 𝐄𝐫𝐫𝐨𝐫! 𝐔𝐧𝐚𝐛𝐥𝐞 𝐭𝐨 𝐬𝐞𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞."), threadID, messageID);
    }
  }
};
