const axios = require("axios");

module.exports = {
  config: {
    name: "screenshot",
    aliases: ["ss"],
    version: "0.0.7",
    role: 0,
    author: "Azadx69x",
    description: "Take any website screenshot",
    category: "utility",
    countDown: 5
  },
  onStart: async function ({ message, args }) {
    if (!args[0]) return message.reply("❌ Please provide a URL!");
    try {
      const res = await axios.get(`https://azadx69x.is-a.dev/api/screenshot?url=${encodeURIComponent(args[0])}`, { responseType: "stream" });
      message.reply({ attachment: res.data });
    } catch (e) {
      console.log(e);
      message.reply("❌ Failed to take screenshot!");
    }
  }
};
