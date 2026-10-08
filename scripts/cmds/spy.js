const axios = require("axios");

const API_URL = "https://stalk-six.vercel.app/api/stalk";
const MEDIA_FIELDS = new Set([
  "profilePictureUrl", "profilePictureWidth", "profilePictureHeight",
  "coverPhotoUrl", "coverPhotoWidth", "coverPhotoHeight"
]);
const LABELS = {
  userId: "UID",
  name: "Name",
  bio: "Bio",
  location: "City",
  hometown: "Hometown",
  workplace: "Workplace",
  education: "Education",
  gender: "Gender",
  relationship: "Relationship",
  birthday: "Birthday",
  friends: "Followers/Friends",
  website: "Website",
  profileLink: "Profile",
  partner: "Partner"
};

const present = value => {
  if (value == null) return false;
  if (typeof value === "string") {
    const text = value.trim();
    return Boolean(text && !/^(?:no ?data|n\/?a|null|undefined|unknown)$/i.test(text));
  }
  if (Array.isArray(value)) return value.some(present);
  if (typeof value === "object") return Object.values(value).some(present);
  return true;
};

const label = key => LABELS[key] || key
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/[_-]+/g, " ")
  .replace(/\b\w/g, char => char.toUpperCase());

const valueText = value => {
  if (Array.isArray(value)) return value.map(valueText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, item]) => present(item))
      .map(([key, item]) => `${label(key)}: ${valueText(item)}`)
      .join(", ");
  }
  return String(value).trim();
};

const profileLines = profile => Object.entries(profile)
  .filter(([key, value]) => !MEDIA_FIELDS.has(key) && present(value))
  .map(([key, value]) => `${label(key)}: ${valueText(value)}`);

const compactMoney = value => {
  let amount = Number(value) || 0;
  const units = ["", "K", "M", "B", "T"];
  let unit = 0;
  while (Math.abs(amount) >= 1000 && unit < units.length - 1) {
    amount /= 1000;
    unit++;
  }
  return `${amount.toFixed(amount % 1 ? 1 : 0)}${units[unit]}`;
};

const getImages = async profile => {
  const urls = [profile.profilePictureUrl, profile.coverPhotoUrl]
    .filter((url, index, all) => present(url) && all.indexOf(url) === index);
  const results = await Promise.all(urls.map(url =>
    axios.get(url, { responseType: "stream", timeout: 10000 })
      .then(response => response.data)
      .catch(() => null)
  ));
  return results.filter(Boolean);
};

module.exports = {
  config: {
    name: "spy",
    aliases: ["stalk", "info", "whois"],
    version: "10.1.1",
    role: 0,
    author: "Rafix4x",
    description: "View all public profile data and bot statistics",
    category: "info",
    countDown: 5,
    guide: { en: "{pn} | {pn} @mention | {pn} <userID> | {pn} <profileURL> | reply + {pn}" }
  },

  onStart: async ({ event, message, usersData, threadsData, args = [] }) => {
    try {
      const { threadID, senderID, messageReply } = event;
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
      if (!profile || typeof profile !== "object") return message.reply("No profile data found.");

      const targetID = present(profile.userId)
        ? String(profile.userId)
        : (/^\d+$/.test(String(query)) ? String(query) : null);
      const [user, thread, allUsers, images] = await Promise.all([
        targetID ? usersData.get(targetID).catch(() => null) : null,
        threadsData.get(threadID).catch(() => null),
        targetID ? usersData.getAll().catch(() => []) : [],
        getImages(profile)
      ]);

      const exp = Number(user?.exp) || 0;
      const balance = Number(user?.money) || 0;
      const knownUser = targetID && allUsers.some(item => String(item.userID) === targetID);
      const member = thread?.members?.find(item => String(item.userID) === targetID);
      const isAdmin = (thread?.adminIDs || []).some(item => String(item?.id ?? item) === targetID);
      const nickname = member?.nickname || thread?.nicknames?.[targetID];
      const botLines = targetID ? [
        "BOT STATS",
        `Money: $${compactMoney(balance)}`,
        `Level: ${Math.floor((Math.sqrt(1 + 0.4 * exp) + 1) / 2)}`,
        knownUser && `EXP rank: #${1 + allUsers.filter(item => (Number(item.exp) || 0) > exp).length}`,
        knownUser && `Money rank: #${1 + allUsers.filter(item => (Number(item.money) || 0) > balance).length}`
      ].filter(Boolean) : [];
      const groupLines = member ? [
        "GROUP INFO",
        present(nickname) && `Nickname: ${nickname}`,
        `Role: ${isAdmin ? "Admin" : "Member"}`,
        `Messages: ${Number(member.count) || 0}`
      ].filter(Boolean) : [];
      const sections = [["PROFILE INFO", ...profileLines(profile)], botLines, groupLines]
        .filter(section => section.length);
      const body = sections.map(section => section.join("\n")).join("\n\n");

      return message.reply(images.length ? { body, attachment: images } : body);
    } catch (error) {
      console.error("[spy]", error.message);
      if (["ECONNABORTED", "ETIMEDOUT"].includes(error.code)) {
        return message.reply("Profile lookup timed out. Try again.");
      }
      return message.reply("Could not load this profile. Try again.");
    }
  }
};
