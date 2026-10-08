const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		aliases: ["ad"],
		version: "4.0.0",
		author: "Mr.king",
		countDown: 5,
		role: 2,
		description: {
			vi: "Thêm, xóa, sửa quyền admin",
			en: "Add, remove, edit admin role"
		},
		category: "owner",
		guide: {
			vi: "   {pn} [add | -a] [<reply> | <@tag> | <uid>]: Thêm quyền admin cho người dùng"
				+ "\n   {pn} [remove | -r] [<reply> | <@tag> | <uid>]: Xóa quyền admin của người dùng"
				+ "\n   {pn} [list | -l]: Liệt kê danh sách admin",
			en: "   {pn} [add | -a] [<reply> | <@tag> | <uid>]: Add admin role for user"
				+ "\n   {pn} [remove | -r] [<reply> | <@tag> | <uid>]: Remove admin role of user"
				+ "\n   {pn} [list | -l]: List all admins"
		}
	},

	langs: {
		vi: {
			added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠️ | %1 người dùng đã có quyền admin từ trước rồi:\n%2",
			missingIdAdd: "⚠️ | Vui lòng reply, tag người dùng hoặc nhập UID để thêm quyền admin",
			removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠️ | %1 người dùng không có quyền admin:\n%2",
			missingIdRemove: "⚠️ | Vui lòng reply, tag người dùng hoặc nhập UID để xóa quyền admin",
			listAdmin: "👑 | Danh sách admin:\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please reply to a message, tag user or enter UID to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please reply to a message, tag user or enter UID to remove admin role",
			listAdmin: "👑 | List of admins:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		switch (args[0]?.toLowerCase()) {
			case "add":
			case "-a": {
				let uids = [];

				if (event.messageReply) {
					uids.push(event.messageReply.senderID);
				} else if (Object.keys(event.mentions).length > 0) {
					uids = Object.keys(event.mentions);
				} else if (args.length > 1) {
					uids = args.slice(1).filter(arg => !isNaN(arg));
				}

				if (uids.length === 0)
					return message.reply(getLang("missingIdAdd"));

				const notAdminIds = [];
				const adminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}

				config.adminBot.push(...notAdminIds);
				const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				
				try {
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				} catch (e) {
					console.error(e);
				}

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
					+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}
			case "remove":
			case "delete":
			case "del":
			case "-r": {
				let uids = [];

				if (event.messageReply) {
					uids.push(event.messageReply.senderID);
				} else if (Object.keys(event.mentions).length > 0) {
					uids = Object.keys(event.mentions);
				} else if (args.length > 1) {
					uids = args.slice(1).filter(arg => !isNaN(arg));
				}

				if (uids.length === 0)
					return message.reply(getLang("missingIdRemove"));

				const notAdminIds = [];
				const adminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}

				for (const uid of adminIds) {
					const index = config.adminBot.indexOf(uid);
					if (index > -1) config.adminBot.splice(index, 1);
				}

				const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				
				try {
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				} catch (e) {
					console.error(e);
				}

				return message.reply(
					(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
					+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
				);
			}
			case "list":
			case "-l": {
				if (!config.adminBot || config.adminBot.length === 0) {
					return message.reply(" | No admins found in bot configuration.");
				}
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}
			default:
				return message.SyntaxError();
		}
	}
};
