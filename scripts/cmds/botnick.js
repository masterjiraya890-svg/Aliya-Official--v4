module.exports = {
  config: {
    name: "botnick",
    aliases: ["setbotnick", "bnick"],
    version: "1.0.0",
    author: "Mr.King",
    countDown: 10,
    role: 2,
    shortDescription: { en: "Change the bot's nickname across all connected groups" },
    category: "admin",
    guide: { en: "{p}botnick [New Nickname]" }
  },

  onStart: async function ({ api, args, message }) {
    const newNickname = args.join(" ").trim();

    if (!newNickname) {
      return message.reply("[ BOT NICKNAME SYSTEM ]\n━━━━━━━━━━━━━━━━━━\nPlease provide a nickname.\nExample: /botnick Missqueen『 ᴀᴅᴅᴀ ᴠᴏʀᴘᴜʀ 』☁️🫧");
    }

    try {
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threadList.filter(thread => thread.isGroup && thread.isSubscribed);
      const botID = api.getCurrentUserID();

      let successCount = 0;
      let failCount = 0;

      for (const thread of groupThreads) {
        try {
          await api.changeNickname(newNickname, thread.threadID, botID);
          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      return message.reply(
        `[ NICKNAME UPDATED ]\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `Nickname successfully broadcasted.\n\n` +
        `» Success: ${successCount} groups\n` +
        `» Failed: ${failCount} groups`
      );

    } catch (error) {
      console.log(error);
      return message.reply("An error occurred while fetching group lists.");
    }
  }
};
