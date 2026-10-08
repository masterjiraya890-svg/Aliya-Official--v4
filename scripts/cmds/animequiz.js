const axios = require("axios");

async function toFont(text, id = 22) {
  try {
    const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const rawRes = await axios.get(GITHUB_RAW);
    const apiBase = rawRes.data.apiv1;

    const apiUrl = `${apiBase}/api/font?id=${id}&text=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);
    return data.output || text;
  } catch (e) {
    console.error("Font API error:", e.message);
    return text;
  }
}

module.exports = {
  config: {
    name: "animequiz",
    aliases: ["animeqz", "aniquiz", "aniqz"],
    version: "4.0.0",
    author: "Mr.king",
    countDown: 10,
    role: 0,
    category: "game",
    guide: { en: "{pn} — Guess the anime character!" }
  },

  onStart: async function ({ api, event }) {
    try {
      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const quizApiBase = rawRes.data.apiv1;

      const { data } = await axios.get(`${quizApiBase}/api/animequiz`);
      const { image, options, answer } = data;

      const imageStream = await axios({ method: "GET", url: image, responseType: "stream" });

      const body = await toFont(`🎌 𝐀𝐧𝐢𝐦𝐞 𝐐𝐮𝐢𝐳 🎭
━━━━━━━━━━━━━━
📷 Guess the Anime Character!

🅐 ${options.A}
🅑 ${options.B}
🅒 ${options.C}
🅓 ${options.D}

⏳ You have 1 minute 30 seconds!
💡 You have 3 chances! Reply with A, B, C or D.`);

      api.sendMessage(
        { body, attachment: imageStream.data },
        event.threadID,
        async (err, info) => {
          if (err) return console.error(err);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            correctAnswer: answer,
            chances: 3,
            answered: false
          });

          setTimeout(async () => {
            const quizData = global.GoatBot.onReply.get(info.messageID);
            if (quizData && !quizData.answered) {
              try {
                await api.unsendMessage(info.messageID);
              } catch {}
              global.GoatBot.onReply.delete(info.messageID);
            }
          }, 90000);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      const failMsg = await toFont("❌ Failed to fetch Anime Quiz data.");
      api.sendMessage(failMsg, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    let { author, correctAnswer, messageID, chances } = Reply;
    const reply = event.body?.trim().toUpperCase();

    if (event.senderID !== author) {
      const msg = await toFont("⚠️ This is not your quiz!");
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (!reply || !["A", "B", "C", "D"].includes(reply)) {
      const msg = await toFont("❌ Please reply with A, B, C or D.");
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (reply === correctAnswer) {
      try {
        await api.unsendMessage(messageID);
      } catch {}

      const rewardCoin = 350;
      const rewardExp = 120;
      const userData = (await usersData.get(event.senderID)) || { money: 0, exp: 0 };
      userData.money += rewardCoin;
      userData.exp += rewardExp;
      await usersData.set(event.senderID, userData);

      const correctMsg = await toFont(`🎯 Sugoi! You guessed it right!

✅ Correct Answer!
💰 +${rewardCoin} Coins
🌟 +${rewardExp} EXP

🏆 You're a true anime fan!`);

      if (global.GoatBot.onReply.has(messageID)) {
        global.GoatBot.onReply.get(messageID).answered = true;
        global.GoatBot.onReply.delete(messageID);
      }

      return api.sendMessage(correctMsg, event.threadID, event.messageID);
    } else {
      chances--;

      if (chances > 0) {
        global.GoatBot.onReply.set(messageID, { ...Reply, chances });
        const wrongTryMsg = await toFont(`❌ Wrong answer!
⏳ You still have ${chances} chance(s) left. Try again!`);
        return api.sendMessage(wrongTryMsg, event.threadID, event.messageID);
      } else {
        try {
          await api.unsendMessage(messageID);
        } catch {}
        const wrongMsg = await toFont(`😢 Out of chances!
✅ The correct option was: ${correctAnswer}`);
        return api.sendMessage(wrongMsg, event.threadID, event.messageID);
      }
    }
  }
};
                                               
