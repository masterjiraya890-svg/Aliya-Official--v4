const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const FOLDER_ID = "1U4yM0YILj0dTx1tpYxK2Vasc3SSuoADC"; 

module.exports.config = {
    name: "onlyanimevideo",
    aliases: ["oav"],
    version: "4.0.1",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    role: 0,
    category: "media",
    guide: { en: "Use {p}oav, {p}oav sync to count files, or comment '🏯' to get a random video." }
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;

    const msg = event.body ? event.body.trim() : "";
    if (msg === "🏯") {
        return handleDriveMedia(api, event);
    }
};

module.exports.onStart = async ({ api, event, args }) => {
    if (args[0] && args[0].toLowerCase() === "sync") {
        return handleDriveSync(api, event);
    }
    return handleDriveMedia(api, event);
};

async function handleDriveSync(api, event) {
    const { threadID, messageID } = event;
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const response = await axios.get(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`).catch(async () => {
            return await axios.get(`https://docs.google.com/uc?export=list&id=${FOLDER_ID}`);
        });

        const htmlData = response.data;
        const matches = [...htmlData.matchAll(/"([^"]+)"\s*,\s*\[\s*"([^"]+)"\s*,\s*([0-9]+)\s*,\s*"([^"]+)"/g)];
        
        let totalFiles = 0;
        let videoCount = 0;
        let pictureCount = 0;
        let musicCount = 0;

        if (matches && matches.length > 0) {
            totalFiles = matches.length;
            matches.forEach(match => {
                const name = match[2].toLowerCase();
                if (name.endsWith(".mp4") || name.endsWith(".mkv") || name.endsWith(".mov") || name.endsWith(".3gp")) videoCount++;
                else if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".webp")) pictureCount++;
                else if (name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".m4a") || name.endsWith(".ogg")) musicCount++;
            });
        } else {
            const fallbackMatches = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/g)];
            totalFiles = fallbackMatches.length;
            videoCount = totalFiles;
        }

        api.setMessageReaction("✅", messageID, () => {}, true);

        const report = `📁 𝔖𝔶𝔫𝔠 𝔖𝔲𝔠𝔠𝔢𝔰𝔰𝔣𝔲𝔩!\n\n` +
                       `• 𝖳𝗈𝗍𝖺𝗅 𝖥𝗂𝗅𝖾𝗌: ${totalFiles}\n` +
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
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const response = await axios.get(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`).catch(async () => {
            return await axios.get(`https://docs.google.com/uc?export=list&id=${FOLDER_ID}`);
        });

        const htmlData = response.data;
        const matches = [...htmlData.matchAll(/"([^"]+)"\s*,\s*\[\s*"([^"]+)"\s*,\s*([0-9]+)\s*,\s*"([^"]+)"/g)];
        
        let fileId = "";

        if (!matches || matches.length === 0) {
            const fallbackMatches = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/g)];
            if (fallbackMatches.length === 0) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("📁 Couldn't find any file😒!", threadID, messageID);
            }
            fileId = fallbackMatches[Math.floor(Math.random() * fallbackMatches.length)][1];
        } else {
            const randomMatch = matches[Math.floor(Math.random() * matches.length)];
            fileId = randomMatch[1]; 
        }

        api.setMessageReaction("👀", messageID, () => {}, true);
        
        const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);

        const filePath = path.join(cacheDir, `oav_${fileId}.mp4`);

        const downloadStream = await axios({
            url: downloadUrl,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(filePath);
        downloadStream.data.pipe(writer);

        writer.on("finish", () => {
            return api.sendMessage({
                body: `ₕₑᵣₑ ᵢₛ ₐ ᵥᵢdₑₒ Fᵣ₏ₘ 𝔐𝔯.𝔎ᵢ𝔫𝔤 ☠️✌🏼`,
                attachment: fs.createReadStream(filePath)
            }, threadID, (err) => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (!err) {
                    api.setMessageReaction("🔥", messageID, () => {}, true);
                } else {
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    api.sendMessage("❌ ভিডিওটি পাঠাতে সমস্যা হয়েছে (সাইজ অনেক বড় হতে পারে)!", threadID, messageID);
                }
            }, messageID);
        });

        writer.on("error", (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে।", threadID, messageID);
        });

    } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("❌ ড্রাইভ থেকে ভিডিও লোড করতে ব্যর্থ হয়েছে।", threadID, messageID);
    }
}
