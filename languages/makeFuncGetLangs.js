const fs = require("fs-extra");
const path = require("path");
const log = require("../logger/log.js");

const defaultLangFile = path.join(__dirname, "en.lang");
let pathLanguageFile = path.join(__dirname, `${global.GoatBot?.config?.language || "en"}.lang`);

if (!fs.existsSync(pathLanguageFile)) {
	log.warn("LANGUAGE", `Can't find language file "${path.basename(pathLanguageFile)}", using default "en.lang"`);
	pathLanguageFile = defaultLangFile;
}

const readLanguage = fs.existsSync(pathLanguageFile) ? fs.readFileSync(pathLanguageFile, "utf-8") : "";
const languageData = readLanguage
	.split(/\r?\n|\r/)
	.filter(line => line && !line.trim().startsWith("#") && !line.trim().startsWith("//") && line.trim() !== "");

global.language = convertLangObj(languageData);

function convertLangObj(dataArray) {
	const obj = {};
	for (const sentence of dataArray) {
		const getSeparator = sentence.indexOf("=");
		if (getSeparator === -1) continue;

		const itemKey = sentence.slice(0, getSeparator).trim();
		const itemValue = sentence.slice(getSeparator + 1).trim();
		const headIndex = itemKey.indexOf(".");
		if (headIndex === -1) continue;

		const head = itemKey.slice(0, headIndex);
		const key = itemKey.slice(headIndex + 1);
		const value = itemValue.replace(/\\n/gi, "\n");

		if (!obj[head]) obj[head] = {};
		obj[head][key] = value;
	}
	return obj;
}

function getText(head, key, ...args) {
	let langObj;
	if (typeof head === "object" && head !== null) {
		let customLangFile = path.join(__dirname, `${head.lang}.lang`);
		head = head.head;
		if (!fs.existsSync(customLangFile)) {
			log.warn("LANGUAGE", `Can't find custom language file "${head.lang}.lang", falling back to "en.lang"`);
			customLangFile = defaultLangFile;
		}
		const readLang = fs.existsSync(customLangFile) ? fs.readFileSync(customLangFile, "utf-8") : "";
		const data = readLang
			.split(/\r?\n|\r/)
			.filter(line => line && !line.trim().startsWith("#") && !line.trim().startsWith("//") && line.trim() !== "");
		langObj = convertLangObj(data);
	} else {
		langObj = global.language;
	}

	if (!langObj[head] || !Object.prototype.hasOwnProperty.call(langObj[head], key)) {
		return `Can't find text: "${head}.${key}"`;
	}

	let text = langObj[head][key];
	for (let i = args.length - 1; i >= 0; i--) {
		text = text.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
	}

	return text;
}

module.exports = getText;
