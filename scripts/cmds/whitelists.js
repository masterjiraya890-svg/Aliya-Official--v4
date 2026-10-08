const { writeFileSync } = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "whitelists",
		aliases: ["wl"],
		version: "4.0.0",
		author: "Mr.king",
		countDown: 2,
		role: 4, // Strictly Bot Dev (Role 4)
		description: {
			en: "Add, remove, edit whiteListIds role"
		},
		category: "owner",
		guide: {
			en: '   {pn} [add | -a] <uid | @tag | reply>: Add user to whitelist'
				+ '\n   {pn} [remove | -r] <uid | @tag | reply>: Remove user from whitelist'
				+ '\n   {pn} [list | -l]: List all whitelisted users'
				+ '\n   {pn} clear: Remove all users from whitelist'
				+ '\n   {pn} -m [on | off]: Turn on/off whitelist mode'
				+ '\n   {pn} -m noti [on | off]: Turn on/off whitelist notification'
		}
	},

	langs: {
		en: {
			added: `Added %1 users to whitelist:\n%2`,
			alreadyAdmin: `\nAlready in whitelist (%1 users):\n%2`,
			missingIdAdd: "Please mention, reply, or enter UID to add to whitelist.",
			removed: `Removed %1 users from whitelist:\n%2`,
			notAdmin: `Not found in whitelist (%1 users):\n%2`,
			missingIdRemove: "Please mention, reply, or enter UID to remove from whitelist.",
			listAdmin: `List of Whitelisted Users:\n%1`,
			cleared: "Cleared all users from whitelist.",
			emptyList: "Whitelist is currently empty.",
			turnedOn: "Turned ON Whitelist Mode (Only whitelisted users can use bot)",
			turnedOff: "Turned OFF Whitelist Mode",
			turnedOnNoti: "Turned ON Whitelist Notification",
			turnedOffNoti: "Turned OFF Whitelist Notification"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang, role }) {
		if (role < 4) {
			return message.reply("Only Bot Developers (Role 4) can use this command.");
		}

		if (!config.whiteListMode) {
			config.whiteListMode = {
				enable: false,
				whiteListIds: []
			};
		}

		const action = (args[0] || "").toLowerCase();

		switch (action) {
			case "add":
			case "-a":
			case "+": {
				let uids = [];
				if (Object.keys(event.mentions || {}).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else if (args.length > 1)
					uids = args.slice(1).filter(arg => !isNaN(arg));

				if (uids.length === 0) return message.reply(getLang("missingIdAdd"));

				const notAdminIds = [];
				const authorIds = [];
				for (const uid of uids) {
					if (config.whiteListMode.whiteListIds.includes(uid))
						authorIds.push(uid);
					else {
						notAdminIds.push(uid);
						config.whiteListMode.whiteListIds.push(uid);
					}
				}

				const getNames = await Promise.all(uids.map(async uid => {
					const name = await usersData.getName(uid);
					return { uid, name };
				}));

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(({ uid, name }) => `• Name: ${name} | UID: ${uid}`).join("\n")) : "")
					+ (authorIds.length > 0 ? getLang("alreadyAdmin", authorIds.length, authorIds.map(uid => `• UID: ${uid}`).join("\n")) : "")
				);
			}

			case "remove":
			case "rm":
			case "-r":
			case "-": {
				let uids = [];
				if (Object.keys(event.mentions || {}).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else if (args.length > 1)
					uids = args.slice(1).filter(arg => !isNaN(arg));

				if (uids.length === 0) return message.reply(getLang("missingIdRemove"));

				const notAdminIds = [];
				const authorIds = [];
				for (const uid of uids) {
					if (config.whiteListMode.whiteListIds.includes(uid)) {
						authorIds.push(uid);
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
					} else {
						notAdminIds.push(uid);
					}
				}

				const getNames = await Promise.all(authorIds.map(async uid => {
					const name = await usersData.getName(uid);
					return { uid, name };
				}));

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(authorIds.length > 0 ? getLang("removed", authorIds.length, getNames.map(({ uid, name }) => `• Name: ${name} | UID: ${uid}`).join("\n")) : "")
					+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• UID: ${uid}`).join("\n")) : "")
				);
			}

			case "clear": {
				if (config.whiteListMode.whiteListIds.length === 0) {
					return message.reply(getLang("emptyList"));
				}
				config.whiteListMode.whiteListIds = [];
				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(getLang("cleared"));
			}

			case "list":
			case "-l": {
				if (config.whiteListMode.whiteListIds.length === 0) {
					return message.reply(getLang("emptyList"));
				}
				const getNames = await Promise.all(config.whiteListMode.whiteListIds.map(async uid => {
					const name = await usersData.getName(uid);
					return { uid, name };
				}));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• Name: ${name} | UID: ${uid}`).join("\n")));
			}

			case "m":
			case "mode":
			case "-m": {
				let isSetNoti = false;
				let value;
				let indexGetVal = 1;

				if (args[1] === "noti") {
					isSetNoti = true;
					indexGetVal = 2;
				}

				if (args[indexGetVal] === "on")
					value = true;
				else if (args[indexGetVal] === "off")
					value = false;
				else
					return message.SyntaxError();

				if (isSetNoti) {
					if (!config.hideNotiMessage) config.hideNotiMessage = {};
					config.hideNotiMessage.whiteListMode = !value;
					message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
				} else {
					config.whiteListMode.enable = value;
					message.reply(getLang(value ? "turnedOn" : "turnedOff"));
				}

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				return;
			}

			default:
				return message.SyntaxError();
		}
	}
};
      
