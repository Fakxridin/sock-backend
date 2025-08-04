const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const { host, port } = require('./startup/config');

if (require('electron-squirrel-startup')) {
  app.quit();
}
let mainWindow = null;
const createWindow = () => {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      devTools: false,
      nodeIntegration: true
    },
    autoHideMenuBar: true,
  });
  mainWindow.hide();

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
};


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  let tray = null
  app.whenReady().then(() => {
    require('./server');

    createWindow()

    app.on('activate', () => {

      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    tray = new Tray(path.join(__dirname, '../build/icon.ico'))
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App', click: function () {
          mainWindow.show();
        }
      },
      {
        label: 'Quit', click: function () {
          mainWindow.destroy();
          app.quit();
        }
      }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
  })
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


