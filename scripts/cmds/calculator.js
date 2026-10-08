const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "calculator",
    version: "1.0",
    author: "Saimx69x",
    role: 0,
    usePrefix: true, 
    shortDescription: "Stylish calculator image via API",
    longDescription: "Generate a stylish calculator image with your expression via API",
    category: "tools",
    guide: "{pn} [expression] → e.g. {pn} 123+456",
    countDown: 3
  },

  onStart: async ({ message, args }) => {
    try {
    
      if (!args.length || !args.join("").match(/^[0-9+\-*/().\s]+$/)) {
        return message.reply(
          "⚠️ You used the calculator command incorrectly!\n\n" +
          "✅ Correct usage examples:\n" +
          "`/calculator 123+456` → Add numbers\n" +
          "`/calculator (12*3)-5` → Complex expression\n\n" +
          "💡 Only use numbers and operators (+, -, *, /, (, )) in the expression."
        );
      }

      const expression = args.join(" ").trim();

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, "calculator.png");

      const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/calculator?calculate=${encodeURIComponent(expression)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");

      fs.writeFileSync(filePath, buffer);

      return message.reply({ attachment: fs.createReadStream(filePath) });

    } catch (err) {
      console.error("❌ Calculator command error:", err.message);
      return message.reply(
        "❌ Failed to generate calculator image.\n💬 Contact author for help: https://m.me/ye.bi.nobi.tai.244493"
      );
    }
  }
};
