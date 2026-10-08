const axios = require("axios");

module.exports = {
  config: {
    name: "check",
    aliases: ["webstatus", "sitecheck", "pingweb"],
    version: "1.0.0",
    author: "Mr. King",
    role: 0,
    shortDescription: "Check if a website is online or offline",
    longDescription: "Pings a website URL to monitor its live availability, status code, and response latency.",
    category: "utility",
    guide: { en: "{pn} [website link]" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    let url = args[0];

    // লিংক না দিলে এরর মেসেজ
    if (!url) {
      return api.sendMessage("❌ | Please provide a website URL to check. Example: /check google.com", threadID, messageID);
    }

    // URL ফরম্যাট ঠিক করা (http/https না থাকলে অটো যোগ করা)
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // টেক্সট বোল্ড করার কাস্টম ফাংশন
    const toBold = (str) => {
      return str.split('').map(char => {
        if (/[A-Z]/.test(char)) return String.fromCodePoint(char.charCodeAt(0) + 119743);
        if (/[a-z]/.test(char)) return String.fromCodePoint(char.charCodeAt(0) + 119737);
        if (/[0-9]/.test(char)) return String.fromCodePoint(char.charCodeAt(0) + 120782);
        return char;
      }).join('');
    };

    api.setMessageReaction("⌛", messageID, () => {}, true);

    const startTime = Date.now();

    try {
      // ওয়েবসাইট হিট করা হচ্ছে
      const response = await axios.get(url, { 
        timeout: 10000, // ১০ সেকেন্ডের বেশি লাগলে অফলাইন ধরবে
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      
      api.setMessageReaction("🟢", messageID, () => {}, true);

      // সাকসেস বা অনলাইন কার্ড
      const infoCard = 
        `╭───〔 𝐖𝐄𝐁𝐒𝐈𝐓𝐄 𝐌𝐎𝐍𝐈𝐓𝐎𝐑 〕──⬣\n` +
        `│ 🌐 ${toBold("URL")}    : ${url}\n` +
        `│ 🟢 ${toBold("Status")} : ${toBold("ONLINE")}\n` +
        `│ 🔢 ${toBold("Code")}   : ${toBold(statusCode + " OK")}\n` +
        `│ ⚡ ${toBold("Ping")}   : ${toBold(responseTime + " ms")}\n` +
        `│ 𝐎𝐰𝐧𝐞𝐫: 𝐌𝐫.𝐊𝐢𝐧𝐠 🌷🌸\n` +
        `╰────────────────⬣`;

      return api.sendMessage(infoCard, threadID, () => {
        // ── SYSTEM REFRESH ──
        if (global.gc) global.gc();
        else if (process.gc) process.gc();
      }, messageID);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      api.setMessageReaction("🔴", messageID, () => {}, true);

      let errorStatus = "OFFLINE / DOWN 🛑";
      let errorCode = error.response ? error.response.status : "TIMEOUT/UNKNOWN";

      // যদি সার্ভার বক বক করে কিন্তু একটিভ থাকে (যেমন 403 Forbidden বা 500 Internal Error)
      if (error.response) {
        errorStatus = "SERVER ERROR (BUT ALIVE) ⚠️";
      }

      // অফলাইন বা এরর কার্ড
      const errorCard = 
        `╭───〔 𝐖𝐄𝐁𝐒𝐈𝐓𝐄 𝐌𝐎𝐍𝐈𝐓𝐎𝐑 〕──⬣\n` +
        `│ 🌐 ${toBold("URL")}    : ${url}\n` +
        `│ 🔴 ${toBold("Status")} : ${toBold(errorStatus)}\n` +
        `│ 🔢 ${toBold("Code")}   : ${toBold(String(errorCode))}\n` +
        `│ ⏳ ${toBold("Time")}   : ${toBold(responseTime + " ms")}\n` +
        `│ 𝐎𝐰𝐧𝐞𝐫: 𝐌𝐫.𝐊𝐢𝐧𝐠 🌷🌸\n` +
        `╰────────────────⬣`;

      return api.sendMessage(errorCard, threadID, () => {
        // ── SYSTEM REFRESH ──
        if (global.gc) global.gc();
        else if (process.gc) process.gc();
      }, messageID);
    }
  }
};
