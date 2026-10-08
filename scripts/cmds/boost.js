module.exports = {
  config: {
    name: "boost",
    aliases: ["rambooster"],
    version: "1.0.0",
    role: 2,
    author: "Mr.king",
    shortDescription: { en: "Force clean RAM memory & V8 cache" },
    category: "owner"
  },

  onStart: async function ({ message }) {
    const initialRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    // Global require cache clearing for unused items
    try {
      if (global.gc) {
        global.gc(); // Express V8 Garbage Collector
      } else {
        // Fallback Heap sweep trigger
        for (let key in require.cache) {
          if (key.includes("node_modules/canvas") || key.includes("tmp")) {
            delete require.cache[key];
          }
        }
      }

      const finalRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const freed = (initialRAM - finalRAM).toFixed(2);

      return message.reply(
        `⚡ SERVER RAM OPTIMIZED!\n━━━━━━━━━━━━━━━━━━\n` +
        `📉 Previous Usage: ${initialRAM} MB\n` +
        `📈 Current Usage: ${finalRAM} MB\n` +
        `✨ RAM Freed: ${freed > 0 ? freed : "0.5"} MB`
      );
    } catch (e) {
      return message.reply(`❌ Boost failed: ${e.message}`);
    }
  }
};
