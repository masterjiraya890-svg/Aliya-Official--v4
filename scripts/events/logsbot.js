const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "4.0",
		author: "Mr.king",
		envConfig: {
			allow: true
		},
		category: "events"
	},

	langs: {
		en: {
			title: "====== Aliya v4 Logs ======",
			added: "\n✅\nEvent: Aliya v4 has been added to a new group\n- Added by: %1",
			kicked: "\n❌\nEvent: Aliya v4 has been kicked\n- Kicked by: %1",
			footer: "\n- User ID: %1\n- Group: %2\n- Group ID: %3\n- Time: %4"
		}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		const { logMessageType, logMessageData, author, threadID } = event;
		const botID = api.getCurrentUserID();

		if (author == botID) return;

		const isAdded = logMessageType === "log:subscribe" && logMessageData?.addedParticipants?.some(item => item.userFbId == botID);
		const isKicked = logMessageType === "log:unsubscribe" && logMessageData?.leftParticipantFbId == botID;

		if (!isAdded && !isKicked) return;

		try {
			let msg = getLang("title");
			let threadName = "";
			const authorName = await usersData.getName(author);
			const { config } = global.GoatBot;

			if (isAdded) {
				try {
					const threadInfo = await api.getThreadInfo(threadID);
					threadName = threadInfo.threadName || "Unnamed Group";
				} catch (e) {
					threadName = "Unknown Group";
				}
				msg += getLang("added", authorName);
			} else if (isKicked) {
				const threadData = await threadsData.get(threadID);
				threadName = threadData?.threadName || "Unknown Group";
				msg += getLang("kicked", authorName);
			}

			const time = getTime("DD/MM/YYYY HH:mm:ss");
			msg += getLang("footer", author, threadName, threadID, time);

			for (const adminID of config.adminBot) {
				api.sendMessage(msg, adminID);
			}
		} catch (err) {
			console.error("[ ALIYA v4 LOGSBOT ERROR ]", err);
		}
	}
};
