const axios = require("axios");

// Syntax Error Fixed: Double quote removed
const FOLDER_ID = "1t9pkb0h51tyk3Oa2auPoldveKZFqCUBo";

module.exports.config = {
    name: "loco",
    aliases: ["localvideo"],
    version: "4.0.0",
    author: "Mr.King 🎭",
    role: 0,
    category: "media",
    guide: { en: "Use {p}loco, {p}loco sync to count files, or comment '😌' to get a random video." }
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;

    const msg = event.body ? event.body.trim() : "";
    if (msg === "😌") {
        return handleDriveMedia(api, event);
    }
};

module.exports.onStart = async ({ api, event, args }) => {
    if (args[0] && args[0].toLowerCase() === "sync") {
        return handleDriveSync(api, event);
    }
    return handleDriveMedia(api, event);
};

async function fetchDriveFiles() {
    try {
        const response = await axios.get(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`);
        const htmlData = response.data;
        const files = [];

        const matches = [...htmlData.matchAll(/"([^"]+)"\s*,\s*\[\s*"([^"]+)"(?:,\s*"([^"]+)")?/g)];
        matches.forEach(m => {
            const id = m[1];
            const name = m[2];
            const mime = m[3] || "";
            if (id && name && !id.includes("/") && !id.includes("http")) {
                files.push({ id, name: name.toLowerCase(), mime: mime.toLowerCase() });
            }
        });

        if (files.length === 0) {
            const fallbackMatches = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/g)];
            fallbackMatches.forEach(m => {
                files.push({ id: m[1], name: "unknown", mime: "" });
            });
        }

        return files;
    } catch (err) {
        console.error("Drive Fetch Error:", err);
        return [];
    }
}

function isVideoFile(f) {
    const name = f.name;
    const mime = f.mime;
    if (mime.includes("video")) return true;
    if (name.endsWith(".mp4") || name.endsWith(".mkv") || name.endsWith(".mov") || name.endsWith(".3gp") || name.endsWith(".webm")) return true;
    if (name.startsWith("messenger_creation") && !name.endsWith(".jpeg") && !name.endsWith(".jpg") && !name.endsWith(".png")) return true;
    return false;
}

function isImageFile(f) {
    const name = f.name;
    const mime = f.mime;
    if (mime.includes("image")) return true;
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".webp")) return true;
    return false;
}

function isAudioFile(f) {
    const name = f.name;
    const mime = f.mime;
    if (mime.includes("audio")) return true;
    if (name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".m4a") || name.endsWith(".ogg")) return true;
    return false;
}

async function handleDriveSync(api, event) {
    const { threadID, messageID } = event;
    try {
        api.setMessageReaction("👀", messageID, () => {}, true);

        const files = await fetchDriveFiles();

        let videoCount = 0;
        let pictureCount = 0;
        let musicCount = 0;

        files.forEach(f => {
            if (isImageFile(f)) pictureCount++;
            else if (isVideoFile(f)) videoCount++;
            else if (isAudioFile(f)) musicCount++;
        });

        api.setMessageReaction("✅", messageID, () => {}, true);

        const report = `📁 𝔖𝔶𝔫𝔠 𝔖𝔲𝔠𝔠𝔢𝔰𝔰𝔣𝔲𝔲𝔩!\n\n` +
                       `• 𝖳𝗈𝗍𝖺𝗅 𝖥𝗂𝗅𝖾𝗌: ${files.length}\n` +
                       `• 𝖵𝗂𝖽𝖾𝗈 / 𝖬𝖯𝖦 𝖥𝗂𝗅𝖾𝗌: ${videoCount}\n` +
                       `• 𝖯𝗂𝖼𝗍𝗎𝗋𝖾 𝖥𝗂𝗅𝖾𝗌: ${pictureCount}\n` +
                       `• 𝖬𝖯𝟥 / 𝖲𝗈𝗇𝗀 𝖥𝗂𝗅𝖾𝗌: ${musicCount}`;

        return api.sendMessage(report, threadID, messageID);

    } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ Error sync!", threadID, messageID);
    }
}

async function handleDriveMedia(api, event) {
    const { threadID, messageID } = event;

    try {
        api.setMessageReaction("☠️", messageID, () => {}, true);

        const files = await fetchDriveFiles();

        if (!files || files.length === 0) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("📁 Couldn't find any file😒!", threadID, messageID);
        }

        const selected = files[Math.floor(Math.random() * files.length)];

        api.setMessageReaction("👀", messageID, () => {}, true);
        const downloadUrl = `https://docs.google.com/uc?export=download&id=${selected.id}`;
        const stream = await global.utils.getStreamFromURL(downloadUrl);

        return api.sendMessage({
            body: `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼`,
            attachment: [stream]
        }, threadID, (err) => {
            if (!err) {
                api.setMessageReaction("🔥", messageID, () => {}, true);
            } else {
                api.sendMessage("❌ ভিডিওটি পাঠাতে সমস্যা হয়েছে (সাইজ অনেক বড় হতে পারে)!", threadID, messageID);
            }
        }, messageID);

    } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ ড্রাইভ থেকে ভিডিও লোড করতে ব্যর্থ হয়েছে।", threadID, messageID);
    }
        }
