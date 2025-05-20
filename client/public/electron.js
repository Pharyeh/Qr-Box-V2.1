const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      contextIsolation: true
    },
    icon: path.join(__dirname, 'qrbox_icon.ico')
  });

  const appUrl = isDev
    ? 'http://localhost:3001'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  win.loadURL(appUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
