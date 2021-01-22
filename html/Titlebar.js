// const electron = require('electron');
(() => {
	const { ipcRenderer } = require('electron');
	const ElectronTitlebarWindows = require('electron-titlebar-windows');

	const titlebar = new ElectronTitlebarWindows({
		darkMode: true,
		backgroundColor: '#fc05f8',
		draggable: true,
	});
	titlebar.appendTo(document.body);

	titlebar.on('close', e => {
		window.close();
	});

	let maximized = false;
	const max = e => {
		maximized = !maximized;
		if (maximized == true) {
			ipcRenderer.sendSync('runFunctionOnWindow', 'maximize');
		} else {
			ipcRenderer.sendSync('runFunctionOnWindow', 'unmaximize');
		}
	};
	titlebar.on('maximize', max);
	titlebar.on('fullscreen', max);

	titlebar.on('minimize', e => {
		ipcRenderer.sendSync('runFunctionOnWindow', 'minimize');
	});
})();
