const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const electron = require('electron');
const path = require('path')
const url = require('url')
const shell = require("electron").shell;
const {autoUpdater} = require('electron-updater');
const isDev = require("electron-is-dev");
// const fetch = require('electron-fetch');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const dialog = electron.dialog
function selectDirectory() {
	dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory']
	}, function(path) {
		console.log(path)
	})
}

let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
	  "width": 900,
	  "height": 300,
	  "min-width": 900,
	  "min-height": 300
  })

  // and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'src/index.html'),
		protocol: 'file:',
		slashes: true
	}))

  // Open the DevTools.

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

	var menu = Menu.buildFromTemplate([
		// {
		// 	label: "debug",
		// 	submenu: [
		// 		{
		// 			label: "Developer window",
		// 			click() {
		// 				win.webContents.openDevTools()
		// 			}
		// 		}
		// 	]
		// }
		{
			label: "Console",
			click() {
				win.webContents.openDevTools();
			}
		}
	]);

	Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
	createWindow();
	console.log("c", autoUpdater);
	autoUpdater.checkForUpdates();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updateReady')
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
