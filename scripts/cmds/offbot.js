module.exports = {
	config: {
		name: "offbot",
		version: "2.0.0",
		author: "Mr.king",
		role: 2,
		countDown: 5,
		category: "system",
		shortDescription: "Shutdown the bot",
		longDescription: "Stylish bot shutdown command.",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		const threadID = event.threadID;

		await api.sendMessage(
	 `╭━━━〔 𝐁𝐎𝐓 𝐎𝐅𝐅 〕━━━╮
┃
┃  💤 𝐆𝐨𝐨𝐝𝐛𝐲𝐞,🏯🎀...
┃
┃  💫 𝐒𝐲𝐬𝐭𝐞𝐦 𝐒𝐡𝐮𝐭𝐭𝐢𝐧𝐠 𝐃𝐨𝐰𝐧
┃  👀 𝐀𝐮𝐭𝐡𝐨𝐫 : 𝐌𝐫.𝐤𝐢𝐧𝐠
┃
╰━━━━━━━━━━━━━━━━━━╯

⏳ 𝐁𝐨𝐭 𝐢𝐬 𝐠𝐨𝐢𝐧𝐠 𝐨𝐟𝐟𝐥𝐢𝐧𝐞... 🖤`,
			threadID
		);

		setTimeout(() => {
			process.exit(0);
		}, 1500);
	}
};
