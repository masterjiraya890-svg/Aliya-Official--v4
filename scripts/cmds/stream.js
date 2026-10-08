const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "stream",
		version: "1.0.0",
		author: "Mr.king",
		countDown: 3,
		role: 0,
		description: {
			en: "Convert and stream media (jpg, gif, mp4, mp3, png) from reply/attachments"
		},
		category: "media",
		guide: {
			en: "   {pn} <format> (Reply to any video/gif/sticker/image)\n   Example: {pn} jpg\n   Example: {pn} gif\n   Example: {pn} mp3\n   Example: {pn} mp4"
		}
	},

	onStart: async ({ api, event, args, message }) => {
		const { messageReply, attachments } = event;

		// Format input check
		let targetFormat = (args[0] || "").toLowerCase().replace(".", "");
		if (!targetFormat) {
			return message.reply("⚠️ | Poroborti format bole din! (Example: {pn} jpg, {pn} gif, {pn} mp4, {pn} mp3)");
		}

		// Media attachment detection
		let targetAttachment = null;
		if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
			targetAttachment = messageReply.attachments[0];
		} else if (attachments && attachments.length > 0) {
			targetAttachment = attachments[0];
		}

		if (!targetAttachment || !targetAttachment.url) {
			return message.reply("⚠️ | Doya kore kono video, gif, sticker ba photo te reply kore command ti use korun!");
		}

		// Loading reaction
		api.setMessageReaction("🛜", event.messageID, () => {}, true);

		const mediaUrl = targetAttachment.url;
		const fileName = `stream_${Date.now()}.${targetFormat}`;
		const filePath = path.join(__dirname, "cache", fileName);

		try {
			// Ensure cache directory exists
			await fs.ensureDir(path.join(__dirname, "cache"));

			// Download media stream
			const response = await axios({
				method: "GET",
				url: mediaUrl,
				responseType: "stream"
			});

			const writer = fs.createWriteStream(filePath);
			response.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});

			// Success reaction
			api.setMessageReaction("☃️", event.messageID, () => {}, true);

			// Send converted stream file
			await message.reply({
				body: `✅ | Stream converted to .${targetFormat} successfully!`,
				attachment: fs.createReadStream(filePath)
			});

			// Cleanup file from storage
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}

		} catch (error) {
			console.error("Stream Command Error:", error);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
			return message.reply(`❌ | Stream process korte somossha hoyeche: ${error.message}`);
		}
	}
};
        
