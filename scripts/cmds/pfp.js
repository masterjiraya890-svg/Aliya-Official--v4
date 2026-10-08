const axios = require("axios");

const API_URL = "https://stalk-six.vercel.app/api/stalk";

const getImages = async (profile) => {
  const urls = [profile.profilePictureUrl, profile.coverPhotoUrl].filter(
    (url, index, all) => Boolean(url && url.trim()) && all.indexOf(url) === index
  );
  
  const results = await Promise.all(
    urls.map((url) =>
      axios
        .get(url, { responseType: "stream", timeout: 10000 })
        .then((response) => response.data)
        .catch(() => null)
    )
  );
  return results.filter(Boolean);
};

module.exports = {
  config: {
    name: "pfp",
    aliases: ["profile", "pp", "profile picture"],
    version: "4.0.0",
    author: "Mr.king",
    role: 0,
    description: {
      en: "Get user name, profile picture and cover photo"
    },
    category: "media",
    countDown: 3,
    guide: {
      en: "{pn} | {pn} @mention | {pn} <userID> | {pn} <profileURL> | reply + {pn}"
    }
  },

  onStart: async ({ event, message, args = [] }) => {
    try {
      const { senderID, messageReply } = event;
      const mentionID = Object.keys(event.mentions || {})[0];
      const input = String(args[0] || "").trim();
      let query = mentionID || messageReply?.senderID || senderID;

      if (/^\d+$/.test(input) || /^https?:\/\/(?:www\.|m\.)?facebook\.com\//i.test(input)) {
        query = input;
      }

      const response = await axios.get(API_URL, {
        params: { userId: String(query) },
        timeout: 15000
      });

      const profile = response.data?.data;
      if (!profile || typeof profile !== "object") {
        return message.reply("❌ No profile data found for this user.");
      }

      const name = profile.name || "Facebook User";
      const images = await getImages(profile);

      const caption = 
`𓍢ִ໋🌸✧ ── ͟͟͞͞Pʀᴏғɪʟᴇ & Cᴏᴠᴇʀ ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ U sᴇʀ N ᴀᴍᴇ : ${name}
ᥫ᭡ U ID : ${profile.userId || query}`;

      if (!images.length) {
        return message.reply(`${caption}\n\n⚠️ Profile or cover image not accessible.`);
      }

      return message.reply({
        body: caption,
        attachment: images
      });
    } catch (error) {
      console.error("[pfp]", error.message);
      if (["ECONNABORTED", "ETIMEDOUT"].includes(error.code)) {
        return message.reply("⚠️ Request timed out. Please try again.");
      }
      return message.reply("❌ Could not fetch profile picture/cover. Please try again.");
    }
  }
};
      
