module.exports = {
  config: {
    name: "prefix",
    aliases: ["setprefix", "pre"],
    version: "1.0.0",
    author: "Mr.king",
    countDown: 3,
    role: 1,
    shortDescription: {
      en: "Change the bot prefix for this group"
    },
    category: "system",
    guide: {
      en: "{pn} [prefix]\n{pn} off"
    }
  },

  onStart: async function ({ message, args, event, threadsData }) {
    const threadID = event.threadID;
    const defaultPrefix = global.GoatBot.config.prefix;

    if (!args[0]) {
      const currentPrefix =
        (await threadsData.get(threadID, "data.prefix")) || defaultPrefix;

      return message.reply(
        "╭━━━〔 ALIYA PREFIX 〕━━━╮\n" +
        "┃ Current: " + currentPrefix + "\n" +
        "┃ Default: " + defaultPrefix + "\n" +
        "┃\n" +
        "┃ Change: " + currentPrefix + "prefix !\n" +
        "┃ Reset:  " + currentPrefix + "prefix off\n" +
        "╰━━━━━━━━━━━━━━━━━━━━━━╯"
      );
    }

    const newPrefix = args.join(" ").trim();

    if (
      newPrefix.toLowerCase() === "off" ||
      newPrefix.toLowerCase() === "reset" ||
      newPrefix.toLowerCase() === "default"
    ) {
      await threadsData.deleteKey(threadID, "data.prefix");

      return message.reply(
        "✅ Group prefix reset successfully!\n" +
        "Default prefix: " + defaultPrefix
      );
    }

    if (newPrefix.length > 3) {
      return message.reply("❌ Prefix must be 1-3 characters.");
    }

    if (/\s/.test(newPrefix)) {
      return message.reply("❌ Prefix cannot contain spaces.");
    }

    if (/^[a-zA-Z0-9]+$/.test(newPrefix)) {
      return message.reply(
        "❌ Please use a symbol as prefix.\nExample: ! / # $"
      );
    }

    await threadsData.set(threadID, newPrefix, "data.prefix");

    return message.reply(
      "╭━━━〔 ALIYA PREFIX UPDATED 〕━━━╮\n" +
      "┃ ✅ New Prefix: " + newPrefix + "\n" +
      "┃\n" +
      "┃ Example: " + newPrefix + "help\n" +
      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
    );
  }
};
