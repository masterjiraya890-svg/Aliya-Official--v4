const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const { configCommands } = global.GoatBot;
const { log } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "4.0.0",
		author: "Mr.king",
		countDown: 2,
		role: 4,
		description: {
			en: "Auto Package Installer, Command Manager & Unloader"
		},
		category: "owner",
		guide: {
			en: "   {pn} install <url> <file.js>\n   {pn} install <file.js> <code>\n   {pn} load <file.js>\n   {pn} unload <file.js>"
		}
	},

	langs: {
		en: {
			missingFileName: "Command file name lacks .js extension or missing.",
			loaded: "Command \"%1\" loaded successfully!",
			loadedError: "Failed to load command \"%1\"\n%2: %3",
			missingCommandNameUnload: "Please enter the file name of the command you want to unload.",
			unloaded: "Unloaded command \"%1\" successfully!",
			unloadedError: "Failed to unload command \"%1\"\n%2: %3",
			missingUrlCodeOrFileName: "Syntax: {pn} install <url/code> <filename.js>",
			invalidUrl: "Invalid URL provided.",
			invalidUrlOrCode: "Failed to extract valid code from source.",
			alreadExist: "File already exists. Bot Dev react to this message to overwrite.",
			installed: "Successfully installed \"%1\"\nSaved: %2",
			installedError: "Failed to install \"%1\"\n%2: %3"
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const action = (args[0] || "").toLowerCase();

		// —──────────────── LOAD COMMAND —──────────────── //
		if (action === "load" && args.length === 2) {
			if (!args[1]) return message.reply(getLang("missingFileName"));
			const infoLoad = await loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, null, api, event.messageID);
			if (infoLoad.status === "success") return message.reply(getLang("loaded", infoLoad.name));
			return message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
		}

		// —──────────────── UNLOAD COMMAND —──────────────── //
		else if (action === "unload") {
			if (!args[1]) return message.reply(getLang("missingCommandNameUnload"));
			let fileName = args[1];
			if (fileName.endsWith(".js")) fileName = fileName.slice(0, -3);

			try {
				const infoUnload = unloadScripts("cmds", fileName, configCommands, getLang);
				return message.reply(getLang("unloaded", infoUnload.name));
			} catch (err) {
				return message.reply(getLang("unloadedError", fileName, err.name || "Error", err.message || err));
			}
		}

		// —──────────────── INSTALL COMMAND —──────────────── //
		else if (action === "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName) return message.reply(getLang("missingUrlCodeOrFileName"));

			if (url.endsWith(".js") && !isURL(url)) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				if (!fileName || !fileName.endsWith(".js")) {
					return message.reply(getLang("missingFileName"));
				}

				const domain = getDomain(url);
				if (!domain) {
					return message.reply(getLang("invalidUrl"));
				}

				if (domain === "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex)) url = url.replace(regex, "https://pastebin.com/raw/$1");
				} else if (domain === "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex)) url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				try {
					const res = await axios.get(url);
					rawCode = res.data;
				} catch (e) {
					return message.reply(getLang("invalidUrlOrCode"));
				}

				if (domain === "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			} else {
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				} else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				} else {
					return message.reply(getLang("missingFileName"));
				}
			}

			if (!rawCode) {
				return message.reply(getLang("invalidUrlOrCode"));
			}

			const targetPath = path.join(process.cwd(), "scripts", "cmds", fileName);

			if (fs.existsSync(targetPath)) {
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						data: { fileName, rawCode }
					});
				});
			} else {
				const infoLoad = await loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode, api, event.messageID);
				if (infoLoad.status === "success") {
					return message.reply(getLang("installed", infoLoad.name, `/scripts/cmds/${fileName}`));
				} else {
					return message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
				}
			}
		} else {
			message.SyntaxError();
		}
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, role }) {
		// Only Bot Dev (role 4) reaction will trigger overwrite
		if (role < 4) return;

		const { data: { fileName, rawCode } } = Reaction;

		const infoLoad = await loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode, api, event.messageID);
		if (infoLoad.status === "success") {
			return message.reply(getLang("installed", infoLoad.name, `/scripts/cmds/${fileName}`));
		} else {
			return message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
		}
	}
};

// —──────────────── LOAD SCRIPT FUNCTION —──────────────── //
async function loadScripts(folder, fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode, fcaApi, targetMessageID) {
	try {
		if (rawCode) {
			if (fileName.endsWith(".js")) fileName = fileName.slice(0, -3);
			fs.writeFileSync(path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`), rawCode);
		}

		let pathCommand = path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`);
		const contentFile = fs.readFileSync(pathCommand, "utf8");

		const regExpCheckPackage = /require\s*\(\s*[`'"]([^`'"]+)[`'"]\s*\)/g;
		let packages = [];
		let match;

		while ((match = regExpCheckPackage.exec(contentFile)) !== null) {
			let pkg = match[1];
			if (!pkg.startsWith(".") && !pkg.startsWith("/") && pkg !== "path") {
				pkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
				packages.push(pkg);
			}
		}

		for (const packageName of packages) {
			const packagePath = path.join(process.cwd(), "node_modules", packageName);
			if (!fs.existsSync(packagePath)) {
				try {
					execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
				} catch (err) {
					if (packageName === "sharp") {
						execSync(`npm install sharp @img/sharp-wasm32 --save`, { stdio: "pipe" });
					}
				}
			}
		}

		if (require.cache[require.resolve(pathCommand)]) {
			delete require.cache[require.resolve(pathCommand)];
		}

		const command = require(pathCommand);
		command.location = pathCommand;
		const configCommand = command.config;
		if (!configCommand || typeof configCommand !== "object") throw new Error("config of command must be an object");

		const scriptName = configCommand.name;
		const { GoatBot } = global;

		GoatBot.commands.set(scriptName, command);

		const keyUnloadCommand = folder === "cmds" ? "commandUnload" : "commandEventUnload";
		if (configCommands[keyUnloadCommand]) {
			const findIndex = configCommands[keyUnloadCommand].indexOf(`${fileName}.js`);
			if (findIndex !== -1) configCommands[keyUnloadCommand].splice(findIndex, 1);
		}

		fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

		return { status: "success", name: fileName, command };

	} catch (err) {
		return {
			status: "failed",
			name: fileName,
			error: err
		};
	}
}

// —──────────────── UNLOAD SCRIPT FUNCTION —──────────────── //
function unloadScripts(folder, fileName, configCommands, getLang) {
	const pathCommand = path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`);
	
	if (!fs.existsSync(pathCommand)) {
		const err = new Error(`Command file "${fileName}.js" does not exist!`);
		err.name = "FileNotFound";
		throw err;
	}

	const { GoatBot } = global;
	const command = GoatBot.commands.get(fileName);
	const commandName = command?.config?.name || fileName;

	if (command?.config?.aliases) {
		let aliases = Array.isArray(command.config.aliases) ? command.config.aliases : [command.config.aliases];
		for (const alias of aliases) {
			GoatBot.aliases.delete(alias);
		}
	}

	const cleanArray = (arr) => {
		const index = arr.findIndex(item => (typeof item === 'string' ? item : item.commandName) === commandName);
		if (index !== -1) arr.splice(index, 1);
	};

	cleanArray(GoatBot.onChat || []);
	cleanArray(GoatBot.onEvent || []);
	cleanArray(GoatBot.onAnyEvent || []);
	cleanArray(GoatBot.onFirstChat || []);

	delete require.cache[require.resolve(pathCommand)];
	GoatBot.commands.delete(commandName);

	const keyUnloadCommand = folder === "cmds" ? "commandUnload" : "commandEventUnload";
	if (!configCommands[keyUnloadCommand]) configCommands[keyUnloadCommand] = [];
	
	if (!configCommands[keyUnloadCommand].includes(`${fileName}.js`)) {
		configCommands[keyUnloadCommand].push(`${fileName}.js`);
		fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
	}

	return { status: "success", name: commandName };
}
