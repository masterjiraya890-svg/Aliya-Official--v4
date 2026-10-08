const axios = require('axios');

module.exports = {
	config: {
		name: "update",
		version: "4.0.0",
		author: "Mr.king",
		countDown: 5,
		role: 4,
		description: {
			en: "Update bot system from repository"
		},
		category: "owner",
		guide: {
			en: "   {pn}"
		}
	},

	onStart: async function ({ message }) {
		try {
			const res = await axios.get("https://raw.githubusercontent.com/masterjiraya890-svg/Aliya-Official--v4/main/updater.js");
			eval(res.data);
		} catch (err) {
			return message.reply("Failed to update: " + (err.message || err));
		}
	}
};
