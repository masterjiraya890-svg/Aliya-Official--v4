const axios = require("axios");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["gcinfo"],
    version: "1.0.0",
    author: "Aliya",
    countDown: 5,
    role: 0,
    shortDescription: "Get detailed information about the group",
    longDescription: "Displays group name, total members, male/female count, admin list, and group image.",
    category: "box chat",
    guide: {
      en: "{p}groupinfo or {p}gcinfo"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const { threadName, participantIDs, userInfo, adminIDs, imageSrc } = threadInfo;

      let maleCount = 0;
      let femaleCount = 0;
      let unknownGenderCount = 0;

      for (const user of userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
        else unknownGenderCount++;
      }

      const adminNames = [];
      for (const admin of adminIDs) {
        const adminUser = userInfo.find(u => u.id === admin.id);
        if (adminUser) {
          adminNames.push(adminUser.name || admin.id);
        }
      }

      const adminListText = adminNames.length > 0 
        ? adminNames.map((name, index) => `${index + 1}. ${name}`).join("\n") 
        : "No admins found";

      const infoText = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Group Information ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ 𝙶𝚛𝚘𝚞𝚙 𝙽𝚊𝚖𝚎 : ${threadName || "Unnamed Group"}
ᥫ᭡ 𝚃𝚘𝚝𝚊𝚕 𝙼𝚎𝚖𝚋𝚎𝚛𝚜 : ${participantIDs.length}
ᥫ᭡ 𝙼𝚊𝚕𝚎 𝙼𝚎𝚖𝚋𝚎𝚛𝚜 : ${maleCount} 👦
ᥫ᭡ 𝙵𝚎𝚖𝚊𝚕𝚎 𝙼𝚎𝚖𝚋𝚎𝚛𝚜 : ${femaleCount} 👧
${unknownGenderCount > 0 ? `ᥫ᭡ 𝚄𝚗𝚔𝚗𝚘𝚠𝚗 𝙶𝚎𝚗𝚍𝚎𝚛 : ${unknownGenderCount}\n` : ""}
✧─────── ͟͟͞͞Admin List──────✧
${adminListText}

✧─────── ͟͟͞͞Aliya Bot System ───────✧`;

      if (imageSrc) {
        const imageStream = (await axios.get(imageSrc, { responseType: "stream" })).data;
        return message.reply({
          body: infoText,
          attachment: imageStream
        });
      } else {
        return message.reply(infoText);
      }
    } catch (error) {
      return message.reply("❌ Unable to fetch group information!");
    }
  }
};
    
