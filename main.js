// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require('fs');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = fs;
const path = require('path');
const { resolve } = path;

const getDir = () => {
	if (!existsSync(`${dataPath}`) || !existsSync(`${dataPath}/scriptPath`)) {
		return null;
	}
	let x = readFileSync(`${dataPath}/scriptPath`);
	if (
		typeof x == typeof void 0 ||
		x == null ||
		!existsSync(readFileSync(`${dataPath}/scriptPath`))
	) {
		return null;
	}
	x = x || '';
	x = x.toString();
	return x;
};

let appendFileSync = (file, content) => {
	fs.appendFileSync(file, `${content}\n`);
};

const logToLogFile = (...a) => {
	if (!existsSync(`${dataPath}/logs`)) {
		mkdirSync(`${dataPath}/logs`);
	}
	return appendFileSync(`${dataPath}/logs/log.log`, `${[...a].join(' ')}`);
};

const log = (...a) => {
	console.log(`[RovoTech ScriptHub]`, ...a);

	if (!existsSync(`${dataPath}/logs`)) {
		mkdirSync(`${dataPath}/logs`);
	}
	logToLogFile(...a);
};

let dataPath = app.getPath('userData');
logToLogFile(`-----------------------------------`);
log(`Starting...`);
log(`Data Save Location: ${dataPath}`);
log(`Log Location: ${resolve(`${dataPath}/logs`)}`);
log(`Run Time: ${new Date().toString()}`);
log(`Script Directory: ${getDir()}`);

let mainWindow;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 620,
		minHeight: 600,
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile('html/app.html');
};

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

// ---

ipcMain.on('select-dir', event => {
	let dir = dialog.showOpenDialogSync({
		title:
			'Select a Directory to place the scripts in (Usually [Path to Synapse or Krnl]>scripts)',
		properties: ['openDirectory'],
		defaultPath: getDir() || '',
		dontAddToRecent: true,
	});
	if (dir) {
		log(`Saving Script Location as ${dir}`);
		writeFileSync(`${dataPath}/scriptPath`, dir);
	} else {
		log(`Script Location Selection Canceled`);
	}
	event.returnValue = dir;
});

ipcMain.on('save-script', (event, scriptName, scriptContents) => {
	writeFileSync(`${getDir()}/${scriptName}`, scriptContents.toString());
	event.returnValue = true;
});

ipcMain.on('log_error', (event, error, additionalInfo) => {
	if (!existsSync(`${dataPath}/logs`)) {
		mkdirSync(`${dataPath}/logs`);
	}

	const errFileMsg = `Error from Rendered Page at ${new Date().toString()}

Error: ${error.toString()}
Additional Information: ${additionalInfo || 'None'}`;

	appendFileSync(
		`${dataPath}/logs/error.log`,
		`${errFileMsg}
-----`
	);

	logToLogFile(``);
	log(
		`An error has occured! See ${resolve(
			`${dataPath}/logs/error.log`
		)} for more information.`
	);
	logToLogFile(`${errFileMsg}\n`);

	event.returnValue = true;
});

ipcMain.on('log', (event, ...msg) => {
	log('Renderer:', ...msg);
	event.returnValue = true;
});

ipcMain.on('getScriptDir', (event, ...msg) => {
	event.returnValue = getDir();
});

ipcMain.on('runFunctionOnWindow', (event, func) => {
	mainWindow[func]();
	event.returnValue = true;
});
