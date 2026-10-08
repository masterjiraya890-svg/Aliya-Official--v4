module.exports = {
	config: {
		name: "checkwarn",
		version: "4.0",
		author: "Mr.king",
		category: "events"
	},

	langs: {
		en: {
			warn: "Member %1 has been warned 3 times before and has been banned from the chat box\n- Name: %1\n- Uid: %2\n- To unban, please use the \"%3warn unban <uid>\" command (with uid as the ID of the person you want to unban)",
			needPermission: "Aliya v4 needs administrator permission to kick banned members"
		}
	},

	onStart: async ({ threadsData, message, event, api, client, getLang }) => {
		if (event.logMessageType === "log:subscribe") {
			const { threadID, logMessageData } = event;
			const threadData = await threadsData.get(threadID);
			const warnList = threadData?.data?.warn;

			if (!warnList || !Array.isArray(warnList)) return;

			const { addedParticipants } = logMessageData;
			for (const user of addedParticipants) {
				const findUser = warnList.find(item => item.userID == user.userFbId);
				if (findUser && findUser.list && findUser.list.length >= 3) {
					const userName = user.fullName;
					const uid = user.userFbId;
					const prefix = client.getPrefix(threadID);

					try {
						await message.send({
							body: getLang("warn", userName, uid, prefix),
							mentions: [{
								tag: userName,
								id: uid
							}]
						});

						api.removeUserFromGroup(uid, threadID, (err) => {
							if (err) return message.send(getLang("needPermission"));
						});
					} catch (err) {
						console.error("[ ALIYA v4 CHECKWARN ERROR ]", err);
					}
				}
			}
		}
	}
};
        
