const fs = require("fs-extra");
const path = require("path");

module.exports = async function () {
	try {
		const appStatePath = path.join(process.cwd(), "appstate.json");
		if (fs.existsSync(appStatePath)) {
			const appStateData = fs.readFileSync(appStatePath, "utf8");
			return JSON.parse(appStateData);
		} else {
			throw new Error("appstate.json file not found in root directory!");
		}
	} catch (error) {
		throw new Error("Failed to load appstate.json: " + error.message);
	}
};
