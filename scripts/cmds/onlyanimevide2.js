const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const FOLDER_ID = "1u28lGcZnRZTn48cfsL06n55jmW2CDU19";

module.exports.config = {
    name: "onlyanimevideo2",
    aliases: ["oav2", "oavv"],
    version: "6.6.6",
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼",
    countDown: 3,
    role: 0,
    category: "media",
    guide: { 
        en: "Use {p}oav2 | {p}oav2 sync | Comment '🛜' to pull random video stream" 
    }
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;

    const msg = event.body ? event.body.trim() : "";
    if (msg === "🛜") {
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
        api.setMessageReaction("🛜", messageID, () => {}, true);

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

        api.setMessageReaction("☃️", messageID, () => {}, true);

        const report = `☠️ 𝔖𝔜𝔄𝔖𝔗𝔈𝔐 𝔖𝔜𝔫𝔠 ℭ𝔬𝔪𝔭𝔩𝔢𝔱𝔢! ☠️\n` +
                       `───────────────────\n` +
                       `• 𝕿𝖔𝖙𝖆𝖑 𝕯𝖆𝖙𝖆: ${totalFiles}\n` +
                       `• 𝖵𝗂𝖽𝖾𝗈 / 𝖬𝖯𝖦 Stream: ${videoCount}\n` +
                       `• 𝖯𝗂𝖼𝗍𝗎𝗋𝖾 Files: ${pictureCount}\n` +
                       `• 𝖬𝖯𝟥 / 𝖲𝗈𝗇𝗀 Stream: ${musicCount}\n` +
                       `───────────────────\n` +
                       `⚡ 𝔖𝔢𝔯𝔳𝔢𝔯: Drive Cloud Node v2`;

        return api.sendMessage(report, threadID, messageID);

    } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ 𝔖𝔶𝔫𝔠 𝔉𝔞𝔦𝔩𝔢𝔡! Drive Node Offline.", threadID, messageID);
    }
}

async function handleDriveMedia(api, event) {
    const { threadID, messageID } = event;

    try {
        api.setMessageReaction("🛜", messageID, () => {}, true);

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
                return api.sendMessage("❌ 𝔑𝔬 𝔐𝔢𝔡𝔦𝔞 𝔉𝔬𝔲𝔫𝔡 𝔦𝔫 ℭ𝔩𝔬𝔲𝔡!", threadID, messageID);
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

        const filePath = path.join(cacheDir, `oav2_${fileId}.mp4`);

        const downloadStream = await axios({
            url: downloadUrl,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(filePath);
        downloadStream.data.pipe(writer);

        writer.on("finish", () => {
            return api.sendMessage({
                body: `☠️ 𝔄𝔫𝔦𝔪𝔢 𝔖𝔱𝔯𝔢𝔞𝔪 ℑ𝔫𝔧𝔢𝔠𝔱𝔢𝔡 ☠️\n───────────────────\nℭ𝔬𝔡𝔢𝔡 𝔅𝔶: 𝔐𝔯.𝔎𝔦𝔫𝔤 ☠️✌🏼`,
                attachment: fs.createReadStream(filePath)
            }, threadID, (err) => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (!err) {
                    api.setMessageReaction("☃️", messageID, () => {}, true);
                } else {
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    api.sendMessage("❌ 𝔉𝔞𝔦𝔩𝔢𝔡 𝔱𝔬 𝔰𝔢𝔫𝔡 𝔳𝔦𝔡𝔢𝔬 (𝔉𝔦𝔩𝔢 𝔰𝔦𝔯𝔢 𝔱𝔬𝔬 𝔩𝔞𝔯𝔤𝔢)", threadID, messageID);
                }
            }, messageID);
        });

        writer.on("error", (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ 𝔇𝔬𝔯𝔫𝔩𝔬𝔞𝔡 𝔖𝔱𝔯𝔢𝔞𝔪 ℑ𝔫𝔱𝔢𝔯𝔯𝔲𝔭𝔱𝔢𝔡!", threadID, messageID);
        });

    } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("❌ 𝔉𝔞𝔱𝔞𝔩 𝔈𝔯𝔯𝔬𝔯: 𝔇𝔯𝔦𝔳𝔢 ℭ𝔬𝔫𝔫𝔢监控 𝔉𝔞𝔦𝔩𝔢𝔡!", threadID, messageID);
    }
}

