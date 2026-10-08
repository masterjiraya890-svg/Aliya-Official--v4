const path = require("path");

module.exports = {
  config: {
    name: "update",
    version: "4.0.1",
    author: "Mr.king",
    countDown: 5,
    role: 4,
    description: { en: "Update Aliya Official V4 from its verified update manifest" },
    category: "owner",
    guide: { en: "   {pn}" }
  },

  onStart: async function ({ message }) {
    try {
      await message.reply("Checking for Aliya V4 updates...");
      const updaterPath = require.resolve(path.resolve(__dirname, "../../updater.js"));
      delete require.cache[updaterPath];
      require(updaterPath);
    } catch (err) {
      return message.reply("Update failed: " + (err.message || err));
    }
  }
};
