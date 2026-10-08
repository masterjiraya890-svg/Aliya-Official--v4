const axios = require('axios');

module.exports = {
	config: {
		name: "update",
		version: "4.0.0",
		author: "Mr.king",
		countDown: 5,
		role: 4, // Bot Developer Only
		description: {
			en: "Update Aliya Official v4 system from GitHub repository"
		},
		category: "owner",
		guide: {
			en: "   {pn}"
		}
	},

	onStart: async function ({ message }) {
		try {
			message.reply("⏳ Checking for updates for Aliya Official v4...");
			const res = await axios.get("https://raw.githubusercontent.com/masterjiraya890-svg/Aliya-Official--v4/main/updater.js");
			eval(res.data);
		} catch (err) {
			return message.reply("❌ Failed to run update: " + (err.message || err));
		}
	}
};
