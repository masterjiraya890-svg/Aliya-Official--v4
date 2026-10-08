const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "kicked",
    version: "1.0",
    author: "Saimx69x",
    countDown: 5,
    role: 0,
    description: "👢 Generate a kicked image for a tagged user",
    category: "fun",
    guide: {
      en: "{pn} @tag or reply — Generate a kicked image"
    }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to their message to use this command 👢",
      fail: "❌ | Couldn't generate kicked image, please try again later."
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const kickerID = event.senderID;
    let kickedID = Object.keys(event.mentions || {})[0];
    if (!kickedID && event.messageReply?.senderID) kickedID = event.messageReply.senderID;
    if (!kickedID) return message.reply(getLang("noTag"));

    try {
      const [kickerName, kickedName] = await Promise.all([
        usersData.getName(kickerID).catch(() => "Unknown"),
        usersData.getName(kickedID).catch(() => "Unknown")
      ]);

      const [kickerAvatar, kickedAvatar] = await Promise.all([
        usersData.getAvatarUrl(kickerID),
        usersData.getAvatarUrl(kickedID)
      ]);

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const apiURL = `${apiBase}/api/kicked?kicker=${encodeURIComponent(kickerAvatar)}&kicked=${encodeURIComponent(kickedAvatar)}`;

      const response = await axios.get(apiURL, { responseType: "arraybuffer" });

      const savePath = path.join(__dirname, "tmp");
      await fs.ensureDir(savePath);
      const imgPath = path.join(savePath, `${kickerID}_${kickedID}_kicked.jpg`);
      await fs.writeFile(imgPath, response.data);

      const text = `👢 ${kickerName} just kicked ${kickedName}!`;
      await message.reply({
        body: text,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 5000);

    } catch (err) {
      console.error("❌ Kicked command error:", err);
      return message.reply(getLang("fail"));
    }
  }
};
