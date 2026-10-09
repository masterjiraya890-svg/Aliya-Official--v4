module.exports = {
  config: {
    name: "supportgc",
    aliases: ["support", "sgc"],
    version: "1.0.0",
    author: "Aliya",
    countDown: 5,
    role: 0,
    shortDescription: "Add user to support group or send invite link",
    longDescription: "Adds the user directly to the official support group. If already added or unable to add, sends the invite link.",
    category: "system",
    guide: {
      en: "{p}supportgc"
    }
  },

  onStart: async function ({ api, event, message }) {
    const supportThreadID = "1705872003789005";
    const inviteLink = "https://m.me/j/AbY50_CsjwrZMPkP/?send_source=gc%3Acopy_invite_link_t";
    const userID = event.senderID;

    try {
      const threadInfo = await api.getThreadInfo(supportThreadID);
      const isAlreadyMember = threadInfo.participantIDs.includes(userID);

      if (isAlreadyMember) {
        return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Support GC ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ আপনি ইতিমধ্যেই আমাদের অফিসিয়াল সাপোর্ট গ্রুপে যুক্ত আছেন!
ᥫ᭡ Group Link : ${inviteLink}`
        );
      }

      await api.addUserToGroup(userID, supportThreadID);
      
      return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Support GC ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ আপনাকে সফলভাবে সাপোর্ট গ্রুপে অ্যাড করা হয়েছে!
ᥫ᭡ Group Link : ${inviteLink}`
      );

    } catch (error) {
      return message.reply(
`𓍢ִ໋🌸✧ ── ͟͟͞͞Aliya v4 Support GC ── ✧🌸𓍢ִ໋🌷͙֒  

ᥫ᭡ আপনাকে সরাসরি গ্রুপে অ্যাড করা সম্ভব হয়নি (আপনার প্রাইভেসির কারণে অথবা বট অ্যাডমিন না থাকায়)।
ᥫ᭡ নিচের লিঙ্কে ক্লিক করে জয়েন করুন:
🔗 ${inviteLink}`
      );
    }
  }
};
