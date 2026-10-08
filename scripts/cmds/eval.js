const util = require("util");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec, execSync } = require("child_process");

module.exports = {
	config: {
		name: "eval",
		version: "4.5.0",
		author: "Mr.king",
		countDown: 0,
		role: 4,
		description: {
			en: "Advanced raw JavaScript execution engine for Aliya v4"
		},
		category: "owner",
		guide: {
			en: "   {pn} <javascript_code>"
		}
	},

	onStart: async function ({ api, event, args, models, usersData, threadsData, globalData, commandName, role }) {
		const { threadID, messageID, senderID } = event;

		if (args.length === 0) {
			return api.sendMessage("⚠️ Code lekho bhai evaluate korar jonno!", threadID, messageID);
		}

		// Easy messaging shortcuts
		const out = (data) => {
			let strData = typeof data !== "string" ? util.inspect(data, { depth: 3 }) : data;
			return api.sendMessage(strData, threadID, messageID);
		};
		const output = out;

		const react = (emoji) => api.setMessageReaction(emoji, messageID, () => {}, true);
		const reply = (text) => api.sendMessage(text, threadID, messageID);
		const send = (text, targetID = threadID) => api.sendMessage(text, targetID);

		const code = args.join(" ");

		try {
			// Comprehensive context injection
			const context = {
				api,
				event,
				args,
				models,
				usersData,
				threadsData,
				globalData,
				role,
				threadID,
				messageID,
				senderID,
				out,
				output,
				react,
				reply,
				send,
				axios,
				fs,
				path,
				exec,
				execSync,
				util,
				require
			};

			const argNames = Object.keys(context);
			const argValues = Object.values(context);

			let result = await eval(`(async (${argNames.join(", ")}) => { ${code} })`) (...argValues);

			if (result === undefined || result === "undefined") {
				return;
			}

			if (typeof result !== "string") {
				result = util.inspect(result, { depth: 2 });
			}

			if (result.length > 3800) {
				result = result.slice(0, 3800) + "\n\n...[Truncated]";
			}

			return api.sendMessage(`✨ [ Aliya v4 Eval Result ] ✨\n\n${result}`, threadID, messageID);
		} catch (err) {
			return api.sendMessage(`❌ [ Aliya v4 Eval Error ] ❌\n\n${err.stack || err.message || err}`, threadID, messageID);
		}
	}
};
