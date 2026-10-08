module.exports = {
	config: {
		name: "autoUpdateThreadInfo",
		version: "4.0",
		author: "Mr.king",
		category: "events"
	},

	onStart: async ({ threadsData, event, api }) => {
		const types = ["log:subscribe", "log:unsubscribe", "log:thread-admins", "log:thread-name", "log:thread-image", "log:thread-icon", "log:thread-color", "log:user-nickname"];
		if (!types.includes(event.logMessageType)) return;

		const { threadID, logMessageData, logMessageType } = event;

		try {
			const threadInfo = await threadsData.get(threadID);
			if (!threadInfo) return;

			let members = threadInfo.members || [];
			let adminIDs = threadInfo.adminIDs || [];

			switch (logMessageType) {
				case "log:subscribe": {
					const { addedParticipants } = logMessageData;
					const threadInfo_Fca = await api.getThreadInfo(threadID);
					threadsData.refreshInfo(threadID, threadInfo_Fca);

					for (const user of addedParticipants) {
						let oldData = members.find(member => member.userID === user.userFbId);
						const isOldMember = !!oldData;
						oldData = oldData || {};
						const { userInfo = [], nicknames = {} } = threadInfo_Fca;

						const newData = {
							userID: user.userFbId,
							name: user.fullName,
							gender: userInfo.find(u => u.id == user.userFbId)?.gender,
							nickname: nicknames[user.userFbId] || null,
							inGroup: true,
							count: oldData.count || 0
						};

						if (!isOldMember) {
							members.push(newData);
						} else {
							const index = members.findIndex(member => member.userID === user.userFbId);
							members[index] = newData;
						}
					}
					await threadsData.set(threadID, members, "members");
					break;
				}

				case "log:unsubscribe": {
					const oldData = members.find(member => member.userID === logMessageData.leftParticipantFbId);
					if (oldData) {
						oldData.inGroup = false;
						await threadsData.set(threadID, members, "members");
					}
					break;
				}

				case "log:thread-admins": {
					if (logMessageData.ADMIN_EVENT === "add_admin") {
						adminIDs.push(logMessageData.TARGET_ID);
					} else {
						adminIDs = adminIDs.filter(uid => uid != logMessageData.TARGET_ID);
					}
					adminIDs = [...new Set(adminIDs)];
					await threadsData.set(threadID, adminIDs, "adminIDs");
					break;
				}

				case "log:thread-name": {
					const threadName = logMessageData.name;
					await threadsData.set(threadID, threadName, "threadName");
					break;
				}

				case "log:thread-image": {
					await threadsData.set(threadID, logMessageData.url, "imageSrc");
					break;
				}

				case "log:thread-icon": {
					await threadsData.set(threadID, logMessageData.thread_icon, "emoji");
					break;
				}

				case "log:thread-color": {
					await threadsData.set(threadID, logMessageData.theme_id, "threadThemeID");
					break;
				}

				case "log:user-nickname": {
					const { participant_id, nickname } = logMessageData;
					const oldData = members.find(member => member.userID === participant_id);
					if (oldData) {
						oldData.nickname = nickname;
						await threadsData.set(threadID, members, "members");
					}
					break;
				}
			}
		} catch (err) {
			console.error("[ ALIYA v4 AUTO_UPDATE_THREAD_INFO ERROR ]", err);
		}
	}
};
