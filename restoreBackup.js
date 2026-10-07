const fs = require("fs-extra");
const readline = require("readline");
const log = require('./logger/log.js');

let versionBackup;
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function recursiveReadDirAndBackup(pathFileOrFolder) {
	const pathFileOrFolderBackup = `${process.cwd()}/backups/${versionBackup}/${pathFileOrFolder}`;
	const pathFileOrFolderRestore = `${process.cwd()}/${pathFileOrFolder}`;

	if (fs.lstatSync(pathFileOrFolderBackup).isDirectory()) {
		if (!fs.existsSync(pathFileOrFolderRestore))
			fs.mkdirSync(pathFileOrFolderRestore, { recursive: true });
		const readDir = fs.readdirSync(pathFileOrFolderBackup);
		readDir.forEach(fileOrFolder => {
			recursiveReadDirAndBackup(`${pathFileOrFolder}/${fileOrFolder}`);
		});
	}
	else {
		fs.copyFileSync(pathFileOrFolderBackup, pathFileOrFolderRestore);
	}
}

(async () => {
	if (process.argv.length < 3) {
		versionBackup = await new Promise((resolve) => {
			rl.question("Input version backup: ", answer => {
				resolve(answer);
			});
		});
	}
	else {
		versionBackup = process.argv[2];
	}

	if (!versionBackup) {
		log.error("RESTORE", `Please input version backup`);
		process.exit(1);
	}

	versionBackup = versionBackup.replace("backup_", ""); 
	versionBackup = `backup_${versionBackup}`;

	const backupFolder = `${process.cwd()}/backups/${versionBackup}`;
	if (!fs.existsSync(backupFolder)) {
		log.error("RESTORE", `Backup folder does not exist: ${backupFolder}`);
		process.exit(1);
	}

	const files = fs.readdirSync(backupFolder);
	for (const file of files)
		recursiveReadDirAndBackup(file);

	const packageJsonPath = `${process.cwd()}/package.json`;
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = require(packageJsonPath);
		packageJson.version = versionBackup.replace("backup_", "");
		fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	}

	log.info("ALIYA v4", `Restored backup ${versionBackup} successfully by Mr.king!`);
	process.exit(0);
})();
