const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'client', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  // Start backend server
  backendProcess = spawn('node', ['server/server.js'], {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
}); 