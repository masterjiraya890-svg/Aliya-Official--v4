const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "anisearch",
                aliases: ["animesr", "anisr"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search and download anime videos",
                        vi: "Tìm kiếm và tải xuống video anime"
                },
                category: "anime",
                guide: {
                        en: '   {pn} <anime name>: Type anime name to search'
                                + '\n   Example: {pn} naruto',
                        vi: '   {pn} <tên anime>: Nhập tên anime để tìm kiếm'
                                + '\n   Ví dụ: {pn} naruto'
                }
        },

        langs: {
                en: {
                        noQuery: "• Baby, please provide a search query.",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× Api Error: fetching anime video: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noQuery: "• Vui lòng nhập tên anime cần tìm.",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× Lỗi khi lấy video anime: %1. Liên hệ MahMUD để được hỗ trợ.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args.length) return message.reply(getLang("noQuery"));

                const kw = args.join(" ");
                const cacheDir = path.join(__dirname, "cache");
                const videoPath = path.join(cacheDir, `anisr_${Date.now()}.mp4`);
                
                await fs.ensureDir(cacheDir);

                try { 
                        api.setMessageReaction("⏳", event.messageID, () => {}, true); 
                } catch (e) {}

                try {
                        const response = await axios.get(`${await baseApiUrl()}/api/anisr?search=${encodeURIComponent(kw)}`, {
                                responseType: "stream",
                                timeout: 60000
                        });

                        const writer = fs.createWriteStream(videoPath);
                        response.data.pipe(writer);

                        await new Promise((resolve, reject) => { 
                                writer.on("finish", resolve);  
                                writer.on("error", reject);
                        });

                        if (fs.statSync(videoPath).size < 100) { 
                                throw new Error("File empty or invalid.");
                        }

                        await message.reply({ 
                                body: getLang("success", kw),
                                attachment: fs.createReadStream(videoPath)
                        });

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                } catch (err) {
                        console.error(err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                } finally {
                        setTimeout(() => { 
                                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); 
                        }, 5000);
                }
        }
};
