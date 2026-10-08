const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "cachefile",
		aliases: ["clearcache", "cacheclean"],
		version: "1.0.0",
		author: "Developer",
		countDown: 5,
		role: 4, // Developer Only
		description: {
			en: "Deletes all cached media and temporary files from cache folders"
		},
		category: "owner",
		guide: {
			en: "   {pn} - Clean all junk files from cache directory"
		}
	},

	onStart: async ({ api, event, message }) => {
		// Loading reaction
		api.setMessageReaction("🛜", event.messageID, () => {}, true);

		// Target cache directories
		const cachePaths = [
			path.join(process.cwd(), "scripts", "cmds", "cache"),
			path.join(process.cwd(), "scripts", "events", "cache"),
			path.join(process.cwd(), "cache")
		];

		let deletedCount = 0;
		let freedSize = 0; // Bytes

		for (const cacheDir of cachePaths) {
			if (fs.existsSync(cacheDir)) {
				const files = fs.readdirSync(cacheDir);

				for (const file of files) {
					// Ignore system files like .gitkeep if needed
					if (file === ".gitkeep") continue;

					const filePath = path.join(cacheDir, file);
					try {
						const stats = fs.statSync(filePath);
						if (stats.isFile()) {
							freedSize += stats.size;
							fs.unlinkSync(filePath);
							deletedCount++;
						}
					} catch (err) {
						console.error(`Failed to delete cache file ${file}:`, err);
					}
				}
			}
		}

		if (deletedCount === 0) {
			api.setMessageReaction("☃️", event.messageID, () => {}, true);
			return message.reply("✨ | Cache folder is already clean! No temporary files found.");
		}

		// Convert bytes to KB or MB
		const sizeFormatted = freedSize > 1024 * 1024 
			? (freedSize / (1024 * 1024)).toFixed(2) + " MB" 
			: (freedSize / 1024).toFixed(2) + " KB";

		// Success reaction
		api.setMessageReaction("☃️", event.messageID, () => {}, true);

		return message.reply(
			`🧹 [ CACHE CLEANER ] 🧹\n` +
			`───────────────────\n` +
			`✅ Deleted Files: ${deletedCount} file(s)\n` +
			`💾 Storage Freed: ${sizeFormatted}\n` +
			`🟢 Status: Cache directories successfully cleaned!`
		);
	}
};

