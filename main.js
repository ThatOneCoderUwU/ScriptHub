// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const { writeFileSync, readFileSync } = require('fs');
const path = require('path');

let dataPath = app.getPath('userData');
console.log(`[RovoTech ScriptHub] Starting...`);
console.log(`[RovoTech ScriptHub] Data Save Location: ${dataPath}`);

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
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

	// const menu = Menu.buildFromTemplate([]);
	// Menu.setApplicationMenu(menu);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const getDir = () => {
	let x = readFileSync(`${dataPath}/scriptPath`);
	x = x || '';
	x = x.toString();
	return x;
};

ipcMain.on('select-dir', event => {
	let dir = dialog.showOpenDialogSync({
		title:
			'Select a Directory to place the scripts in (Usually [Path to Synapse or Krnl]>scripts)',
		properties: ['openDirectory'],
		defaultPath: getDir(),
		dontAddToRecent: true,
	});
	if (dir) {
		console.log(`[RovoTech ScriptHub] Saving Script Location as ${dir}`);
		writeFileSync(`${dataPath}/scriptPath`, dir);
	} else {
		console.log(`[RovoTech ScriptHub] Script Location Selection Canceled`);
	}
	event.returnValue = dir;
});

ipcMain.on('save-script', (event, scriptName) => {
	writeFileSync(`${getDir()}/${scriptName}`);
	event.returnValue = true;
});
