const axios = require("axios");

const FOLDER_ID = "1Z5o-yB7FoA5AXhGrdZV-uWXQ1nEZ9Hlb";

if (!global.memeSentCache) {
    global.memeSentCache = new Set();
}

module.exports = {
    config: {
        name: "meme",
        aliases: ["memevid"],
        version: "2.0.0",
        author: "Mr.King ",
        countDown: 3,
        role: 0,
        category: "media",
        shortDescription: { en: "Get random meme images or videos from Google Drive" },
        guide: { en: "{pn} for image, memevid for video, meme sync to refresh, or send '🤡'" }
    },

    onChat: async function ({ api, event }) {
        if (event.senderID == api.getCurrentUserID()) return;
        const msg = event.body ? event.body.trim() : "";
        if (msg === "🤡") {
            return sendDriveMedia(api, event, "random");
        }
    },

    onStart: async function ({ api, event, commandName, args }) {
        const cmd = commandName ? commandName.toLowerCase() : "meme";

        if (args[0] && args[0].toLowerCase() === "sync") {
            return handleSync(api, event);
        }

        const mediaType = cmd === "memevid" ? "video" : "image";
        return sendDriveMedia(api, event, mediaType);
    }
};

async function fetchDriveFiles() {
    try {
        // Direct Google Drive Folder Scraper via Drive API Internal Endpoint
        const url = `https://drive.google.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&pageSize=1000`;
        
        // Fallback HTML scraping using enhanced Regex
        const htmlResponse = await axios.get(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`);
        const htmlData = htmlResponse.data;
        const files = [];

        // Match patterns: [ "FILE_ID", "FILE_NAME", "MIME_TYPE" ] or array patterns in drive html
        const regex = /\["([^"]{25,50})",\s*\["([^"]+)"(?:,\s*"([^"]+)")?/g;
        let match;

        while ((match = regex.exec(htmlData)) !== null) {
            const id = match[1];
            const name = match[2];
            const mime = match[3] || "";
            if (id && name && !id.includes("/") && !id.includes("http")) {
                files.push({ id, name: name.toLowerCase(), mime: mime.toLowerCase() });
            }
        }

        // Secondary fallback match
        if (files.length === 0) {
            const matches = [...htmlData.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/g)];
            matches.forEach(m => {
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
    
    // Check mime type
    if (mime.includes("video")) return true;
    
    // Check file extensions
    if (name.endsWith(".mp4") || name.endsWith(".mp4") || name.endsWith(".png") || name.endsWith(".mp3") || name.endsWith(".jpg")) return true;
    
    // Check Messenger video naming pattern (from screenshot)
    if (name.startsWith("messenger_creation") && !name.endsWith(".jpeg") && !name.endsWith(".jpg") && !name.endsWith(".png")) {
        return true; 
    }

    return false;
}

function isImageFile(f) {
    const name = f.name;
    const mime = f.mime;

    if (mime.includes("image")) return true;
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif") || name.endsWith(".webp")) return true;

    return false;
}

async function handleSync(api, event) {
    const { threadID, messageID } = event;
    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        global.memeSentCache.clear();
        const allFiles = await fetchDriveFiles();

        let imageCount = 0;
        let videoCount = 0;

        allFiles.forEach(f => {
            if (isImageFile(f)) imageCount++;
            else if (isVideoFile(f)) videoCount++;
        });

        api.setMessageReaction("✅", messageID, () => {}, true);

        const msg = `🔄 𝖢𝖺𝖼𝗁𝖾 𝖢𝗅𝖾𝖺𝗋𝖾𝖽 & 𝖲𝗒𝗇𝖼𝖾𝖽!\n\n` +
                    `🖼️ Total Images (JPG/PNG): ${imageCount}\n` +
                    `🎬 Total Videos (MP4): ${videoCount}\n` +
                    `📁 Total Files: ${allFiles.length}`;

        return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
        console.error("Sync Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ 𝖲𝗈𝗆𝖾𝗍𝗁𝗂𝗇𝗀 𝗐𝖾𝗇𝗍 𝗐𝗋𝗈𝗇𝗀 𝖽𝗎𝗋𝗂𝗇𝗀 𝗌𝗒𝗇𝖼!", threadID, messageID);
    }
}

async function sendDriveMedia(api, event, type) {
    const { threadID, messageID } = event;

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const allFiles = await fetchDriveFiles();

        if (!allFiles || allFiles.length === 0) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("📁 𝖭𝗈 𝗆𝖾𝖽𝗂𝖺 𝖿𝗈𝗎𝗇𝖽 𝗂𝗇 𝗍𝗁𝗂𝗌 𝖽𝗋𝗂𝗏𝖾 𝖿𝗈𝗅𝖽𝖾𝗋!", threadID, messageID);
        }

        let filteredFiles = allFiles.filter(f => {
            if (type === "video") return isVideoFile(f);
            if (type === "image") return isImageFile(f);
            return isVideoFile(f) || isImageFile(f);
        });

        if (filteredFiles.length === 0) {
            filteredFiles = allFiles;
        }

        let unplayed = filteredFiles.filter(f => !global.memeSentCache.has(f.id));

        if (unplayed.length === 0) {
            filteredFiles.forEach(f => global.memeSentCache.delete(f.id));
            unplayed = [...filteredFiles];
        }

        const selected = unplayed[Math.floor(Math.random() * unplayed.length)];
        global.memeSentCache.add(selected.id);

        const downloadUrl = `https://docs.google.com/uc?export=download&id=${selected.id}`;
        const stream = await global.utils.getStreamFromURL(downloadUrl);

        api.setMessageReaction("🔥", messageID, () => {}, true);

        const isVid = isVideoFile(selected);
        const caption = isVid ? "🎬 𝘏ₑᵣₑ ᵢₛ ₐ ₘₑₘₑ ᵥᵢdₑₒ ⨾" : "🖼️ 𝘏ₑᵣₑ ᵢₛ ₐ ₘₑₘₑ ";

        return api.sendMessage({
            body: caption,
            attachment: [stream]
        }, threadID, messageID);

    } catch (err) {
        console.error("Meme Media Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ 𝖲𝗈𝗆𝖾𝗍𝗁𝗂𝗇𝗀 𝗐𝖾𝗇𝗍 𝗐𝗋𝗈𝗇𝗀 𝖽𝗎𝗋𝗂𝗇𝗀 𝗌𝗒𝗇𝖼!", threadID, messageID);
    }
        }
