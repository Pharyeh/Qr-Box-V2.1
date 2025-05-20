const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let server;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      contextIsolation: true,
    },
  });

  // Load the locally built React app
  win.loadFile(path.join(__dirname, 'client/build/index.html'));
}

app.whenReady().then(() => {
  // Start backend server
  server = spawn('npm', ['run', 'server'], { shell: true });

  server.stdout.on('data', (data) => {
    console.log(`[server]: ${data}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`[server ERROR]: ${data}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (server) server.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
