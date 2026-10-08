 
module.exports = {
  config: {
    name: "npx",
    version: "1.0.0",
    author: "Aliya",
    countDown: 2,
    role: 0,
    shortDescription: "Run commands without prefix",
    longDescription: "Enable or disable prefixless command usage",
    category: "system"
  },

  onStart: async function ({ message, args, event, threadsData }) {
    if (!args[0]) {
      return message.reply(
        "❌ Usage:\n" +
        "npx <command> → Enable prefixless mode\n" +
        "npx -r <command> → Disable prefixless mode"
      );
    }

    const threadID = event.threadID;
    const command = args[0] === "-r" ? args[1] : args[0];

    if (!command) {
      return message.reply("❌ Command name missing!");
    }

    let data = await threadsData.get(threadID, "data.npx");

    if (!data) data = {};

    // Remove prefixless command
    if (args[0] === "-r") {
      delete data[command.toLowerCase()];

      await threadsData.set(threadID, data, "data.npx");

      return message.reply(
        `✅ ${command} এখন আবার prefix দিয়ে ব্যবহার করতে হবে।`
      );
    }

    // Enable prefixless command
    data[command.toLowerCase()] = true;

    await threadsData.set(threadID, data, "data.npx");

    return message.reply(
      `✅ ${command} এখন prefix ছাড়া ব্যবহার করা যাবে!\n\nExample: ${command}`
    );
  },

  onChat: async function ({ event, message, threadsData, commandName }) {
    if (!event.body) return;

    const text = event.body.trim();
    if (!text) return;

    const threadID = event.threadID;
    const data = await threadsData.get(threadID, "data.npx");

    if (!data || Object.keys(data).length === 0) return;

    const firstWord = text.split(/\s+/)[0].toLowerCase();

    if (!data[firstWord]) return;

    // Existing command system যেন এটাকে normal command হিসেবে process করতে পারে
    if (commandName === firstWord) return;

    return message.reply(
      `⚠️ "${firstWord}" prefixless mode-এ enabled আছে, কিন্তু তোমার GoatBot v2-এর command handler থেকে সরাসরি execute করার জন্য custom handler লাগবে।`
    );
  }
};