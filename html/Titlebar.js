// const electron = require('electron');
const ElectronTitlebarWindows = require('electron-titlebar-windows');

const titlebar = new ElectronTitlebarWindows({
	darkMode: true,
	backgroundColor: '#fc05f8',
	draggable: true,
});
titlebar.appendTo(document.body);

titlebar.on('close', function (e) {
	window.close();
});
