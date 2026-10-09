const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const cooldown = new Map();

/* ───────── VIP PRICE TABLE ───────── */
const VIP_PRICES = {
  1: 25_000_000,
  2: 50_000_000,
  3: 75_000_000,
  4: 100_000_000,
  5: 125_000_000,
  6: 150_000_000,
  7: 175_000_000,
  8: 200_000_000,
  9: 225_000_000,
  10: 250_000_000,
  15: 375_000_000,
  30: 750_000_000
};

const BASE_PRICE_PER_DAY = 25_000_000;

const formatDate = ts => {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const formatMoney = n => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(n % 1e9 ? 1 : 0)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 ? 1 : 0)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n % 1e3 ? 1 : 0)}K`;
  return String(n);
};

const calculatePrice = (days) => {
  if (VIP_PRICES[days]) return VIP_PRICES[days];
  return days * BASE_PRICE_PER_DAY;
};

const getTimeRemaining = (expiryTimestamp) => {
  const now = Date.now();
  const diff = expiryTimestamp - now;
  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / HOUR);

  if (days === 0) return `${hours} hours`;
  return `${days} days, ${hours} hours`;
};

module.exports = {
  config: {
    name: "vip",
    version: "4.0.0",
    author: "Aliya Bot",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Premium VIP system" },
    longDescription: { en: "Buy VIP, admin add/remove, auto-expire check" },
    category: "economy",
    guide: {
      en: "{p}vip\n" +
          "{p}vip list\n" +
          "{p}vip my\n" +
          "{p}vip buy <days>\n" +
          "{p}vip add <days> (reply/mention)\n" +
          "{p}vip remove (reply/mention)"
    }
  },

  onStart: async function ({ api, event, args, usersData, message, role }) {
    const uid = event.senderID;

    const now = Date.now();
    if (cooldown.get(uid) && now - cooldown.get(uid) < 3000)
      return message.reply("⏳ Please wait 3 seconds before using this command again.");
    cooldown.set(uid, now);

    // Auto-clean expired VIPs
    const allUsers = await usersData.getAll();
    for (const u of allUsers) {
      if (u.data?.vip?.expires && u.data.vip.expires <= Date.now()) {
        await usersData.set(u.userID, {
          data: { ...u.data, vip: null }
        });
      }
    }

    /* ───────── TARGET ID HELPER ───────── */
    const getTargetID = () => {
      if (event.type === "message_reply") return event.messageReply.senderID;
      if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
      // Search in args for explicit raw numerical ID
      const explicitID = args.find(a => !isNaN(a) && a.length >= 10);
      if (explicitID) return explicitID;
      return null;
    };

    /* ───────── CHECK OWN VIP STATUS ───────── */
    if (args[0] === "my") {
      const user = await usersData.get(uid);
      const vipData = user.data?.vip;

      if (!vipData || !vipData.expires || vipData.expires <= Date.now()) {
        return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP Status ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ Status : ❌ Inactive
ᥫ᭡ Notice : You do not have an active VIP subscription.
📌 Buy VIP using: {p}vip buy <days>`
        );
      }

      const timeLeft = getTimeRemaining(vipData.expires);
      const userName = await usersData.getName(uid);

      return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP Status ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ User : ${userName}
ᥫ᭡ Status : ✅ Active VIP
ᥫ᭡ Expires : ${formatDate(vipData.expires)}
ᥫ᭡ Time Left : ${timeLeft}`
      );
    }

    /* ───────── LIST VIP USERS ───────── */
    if (args[0] === "list") {
      let out = `𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Active VIP List ── ✧🌸𓍢ִ໋🌷͙֒\n\n`;
      let count = 0;
      const freshUsers = await usersData.getAll();

      for (const u of freshUsers) {
        if (u.data?.vip?.expires && u.data.vip.expires > Date.now()) {
          const timeLeft = getTimeRemaining(u.data.vip.expires);
          out += `ᥫ᭡ ${u.name || "User"} (${u.userID})\n    Expires: ${formatDate(u.data.vip.expires)} (${timeLeft})\n\n`;
          count++;
        }
      }

      if (!count) return message.reply("⚠️ No active VIP users found in database.");
      return message.reply(out);
    }

    /* ───────── ADMIN ADD VIP ───────── */
    if (args[0] === "add") {
      if (role < 2) return message.reply("❌ This command is restricted to Bot Admins only!");

      let days = parseInt(args[1]);
      let tid = getTargetID();

      // Handle case: /vip add 10 (without reply/mention) -> assign to admin user
      if (isNaN(days)) {
        days = parseInt(args[0]);
      }

      if (!days || isNaN(days) || days <= 0) {
        return message.reply("❌ Please provide a valid number of days! Example: {p}vip add 10");
      }

      // If no reply, mention, or UID target, default target to caller (admin)
      if (!tid) tid = uid;

      const user = await usersData.get(tid);
      const currentData = user.data || {};
      const currentExpire = currentData.vip?.expires || Date.now();
      const startTime = Math.max(currentExpire, Date.now());
      const expires = startTime + (days * DAY);

      await usersData.set(tid, { data: { ...currentData, vip: { expires } } });
      const name = await usersData.getName(tid);

      return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP System ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ Action : VIP Added Successfully
ᥫ᭡ User : ${name}
ᥫ᭡ Duration : ${days} days
ᥫ᭡ Expiration : ${formatDate(expires)}`
      );
    }

    /* ───────── ADMIN REMOVE VIP ───────── */
    if (args[0] === "remove") {
      if (role < 2) return message.reply("❌ This command is restricted to Bot Admins only!");

      let tid = getTargetID();
      if (!tid) tid = uid;

      const user = await usersData.get(tid);
      await usersData.set(tid, { data: { ...user.data, vip: null } });
      const name = await usersData.getName(tid);

      return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP System ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ Action : VIP Removed
ᥫ᭡ User : ${name}`
      );
    }

    /* ───────── BUY VIP ───────── */
    if (args[0] === "buy") {
      const days = parseInt(args[1]);
      if (!days || isNaN(days) || days <= 0) {
        return message.reply(
`❌ Invalid duration provided.
📌 Usage: {p}vip buy <days>
📌 Example: {p}vip buy 15`
        );
      }

      const price = calculatePrice(days);
      const user = await usersData.get(uid);
      const wallet = user.money || 0;

      if (wallet < price) {
        return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP Purchase ── ✧🌸𓍢ִ໋🌷͙֒  

❌ Insufficient Balance!
ᥫ᭡ Required Price : ${formatMoney(price)}
ᥫ᭡ Your Balance : ${formatMoney(wallet)}
ᥫ᭡ Remaining Needed : ${formatMoney(price - wallet)}`
        );
      }

      await usersData.set(uid, { money: wallet - price });
      const currentData = user.data || {};
      const currentExpire = currentData.vip?.expires || Date.now();
      const startTime = Math.max(currentExpire, Date.now());
      const expires = startTime + (days * DAY);

      await usersData.set(uid, { data: { ...currentData, vip: { expires } } });

      return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP Activated ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ Duration : ${days} days
ᥫ᭡ Price Paid : ${formatMoney(price)}
ᥫ᭡ Current Balance : ${formatMoney(wallet - price)}
ᥫ᭡ Expiration Date : ${formatDate(expires)}`
      );
    }

    /* ───────── VIP PRICE MENU (DEFAULT) ───────── */
    return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 VIP Rate Card ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ 1 Day  → 25M
ᥫ᭡ 2 Days → 50M
ᥫ᭡ 3 Days → 75M
ᥫ᭡ 7 Days → 175M
ᥫ᭡ 15 Days → 375M
ᥫ᭡ 30 Days → 750M

📌 Buy VIP : {p}vip buy <days>
📌 Check VIP Status : {p}vip my`
    );
  }
};
  
