const axios = require("axios");

const roniTriggers = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "bot",
    "জান",
    "জানু",
    "বেবি",
    "wifey",
    "aliya",
    "king",
    "mrking",
    "roni"
];

const baseApiUrl = "https://baby-one-zeta.vercel.app";

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "aliya"],
    version: "26.0",
    author: "Roni",
    countDown: 0,
    role: 0,
    description: "Smartest response bot API integrated",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage]"
    }
};

const makeBold = (text) => {
    if (!text) return "";
    const fonts = {
        a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
        n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
        A: "𝗔", B: "𝗕", C: "Ｃ", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "Ｋ", L: "𝗟", M: "𝗠",
        N: "𝗡", O: "𝗢", P: "𝗣", Q: "Q", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝘫", Y: "𝗬", Z: "𝗭",
        "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
    };
    return text.split("").map(char => fonts[char] || char).join("");
};

const handleMediaCheck = (attachments) => {
    if (attachments && attachments.length > 0) {
        const type = attachments[0].type;
        const replies = {
            video: ["Mb nai bby pore dio", "ajaira sop video😒", "1 ta kidni de then dekhmu"],
            audio: ["Sent 100000000tk to bkash then I will listen", "aj boyra bole kisu sunte parlam na😤"],
            photo: ["iss amk picture diye potanor chesta 🌚😘", "pic dekhe ki hobe jokon mb e nai"],
            animated_image: ["iss gif pic diye potanor chesta 🌚😘", "pic dekhe ki hobe jokon mb e nai"]
        };
        if (replies[type]) {
            const list = replies[type];
            return list[Math.floor(Math.random() * list.length)];
        }
    }
    return null;
};

const fetchBotResponse = async (text) => {
    try {
        const res = await axios.post(`${baseApiUrl}/api/aliya`, { text: text });
        if (res.data && res.data.message) {
            return res.data.message;
        }
    } catch (e) {}
    
    const defaultReplies = [
        "কথা কম কও, মুখে মাস্ক পইরা ঘোড়ো 😷🔥",
        "মাথাডা একদম আউলায়া দিলা তো ভাই 😵‍💫💭",
        "এমবি নাই ভাই, এমবি কিনে দে তারপর কথা কমু 📱💸",
        "পড়ালেখা বাদ দিয়া বটের লগে আলু ছুলতে আইছো? 🥔📚",
        "এক চ্যাপা মাইরা একবারে উগান্ডা পাঠায়া দিমু ✈️🐒",
        "চা খাইবা? না খাইলে ভাগো তো এখান থেকে ☕🧹",
        "তর কথা শুইন্যা আমার ফ্রিজের পানিও গরম হয়া গেছে 🧊🔥",
        "আমারে কি গুগল পাইছ নাকি? সব প্রশ্নের উত্তর পাইবা 🤖❌"
    ];
    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
};

module.exports.onStart = async ({ api, event, args }) => {
    if (module.exports.config.author !== "Roni") {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    const rawMsg = args ? args.join(" ") : "";
    const msg = rawMsg.toLowerCase().trim();

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "I love you", "Welcome to Aliya Bot! 😎"];
            return api.sendMessage(makeBold(ran[Math.floor(Math.random() * ran.length)]), event.threadID, event.messageID);
        }

        if (msg === "list" || msg === "datacheck") {
            try {
                const res = await axios.get(`${baseApiUrl}/api/jan/stats`);
                if (res.data && res.data.success) {
                    const stats = `🐤 | Total Triggers = ${res.data.totalTeach}\n♻️ | Total Responses = ${res.data.totalResponses}\n💾 | Data Size = ${res.data.dataSize}`;
                    return api.sendMessage(makeBold(stats), event.threadID, event.messageID);
                }
            } catch (e) {
                return api.sendMessage("❌ Database stats offline!", event.threadID, event.messageID);
            }
        }

        const mediaReply = handleMediaCheck(event.attachments);
        let replyMsg = mediaReply;
        if (!replyMsg) {
            replyMsg = await fetchBotResponse(rawMsg);
        }

        return api.sendMessage(makeBold(replyMsg), event.threadID, (err, info) => {
            if (!err && info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);

    } catch (err) {
        console.error(err);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (module.exports.config.author !== "Roni") return;
    try {
        const text = event.body || "";
        const mediaReply = handleMediaCheck(event.attachments);
        
        let replyMsg = mediaReply;
        if (!replyMsg) {
            if (!text.trim()) return;
            replyMsg = await fetchBotResponse(text);
        }

        api.sendMessage(makeBold(replyMsg), event.threadID, (err, info) => {
            if (!err && info) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);
    } catch (err) {
        console.error(err);
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        if (module.exports.config.author !== "Roni") return;

        // Prevent double response when replying to a message
        if (event.type === "message_reply") return;

        const body = event.body ? event.body.toLowerCase() : "";
        const prefix = global.GoatBot?.config?.prefix || "!";
        
        // Skip command prefix
        if (body.startsWith(prefix)) return;

        const hasTrigger = roniTriggers.some(word => body.startsWith(word));

        if (hasTrigger) {
            api.setMessageReaction("🪽", event.messageID, () => {}, true);

            let text = event.body || "";
            for (const word of roniTriggers) {
                if (body.startsWith(word)) {
                    text = event.body.substring(word.length).trim();
                    break;
                }
            }

            const mediaReply = handleMediaCheck(event.attachments);
            if (mediaReply) {
                return api.sendMessage(makeBold(mediaReply), event.threadID, (err, info) => {
                    if (!err && info) {
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName: module.exports.config.name,
                            type: "reply",
                            messageID: info.messageID,
                            author: event.senderID
                        });
                    }
                }, event.messageID);
            }

            if (!text) {
                const randomMessage = [
                    "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",
                    "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
                    "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
                    "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
                    "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, Roni ,Roni ও তো করতে পারো😑?",
                    "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
                    "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
                    "হটাৎ আমাকে মনে পড়লো 🙄",
                    "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
                    "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
                    "খাওয়া দাওয়া করসো 🙄",
                    "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
                    "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
                    "আরে Bolo আমার জান, কেমন আসো? 😚",
                    "oi mama ar dakis na pilis 😿",
                    "amr JaNu lagbe,Tumi ki single aso?"
                ];
                const babyMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
                return api.sendMessage(makeBold(babyMessage), event.threadID, (err, info) => {
                    if (!err && info) {
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName: module.exports.config.name,
                            type: "reply",
                            messageID: info.messageID,
                            author: event.senderID
                        });
                    }
                }, event.messageID);
            }

            const replyMsg = await fetchBotResponse(text);

            return api.sendMessage(makeBold(replyMsg), event.threadID, (err, info) => {
                if (!err && info) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: module.exports.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};

