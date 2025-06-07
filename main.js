// main.js
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
let backendProcess;
let mainWindow;

function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'client/dist/index.html'));
  }
  mainWindow.maximize(); // Launch maximized
  console.log('Window should be visible now.');
}

function startBackend() {
  const command = isDev ? 'npm' : 'node';
  const args = isDev ? ['run', 'server'] : ['server/server.js'];
  backendProcess = spawn(command, args, {
    shell: true,
    env: process.env,
  });
  backendProcess.stdout.on('data', data => console.log(`[Backend]: ${data}`));
  backendProcess.stderr.on('data', err => console.error(`[Backend ERROR]: ${err}`));
}

app.whenReady().then(() => {
  startBackend();
  console.log('About to create window...');
  createWindow();
  console.log('Window creation called.');

  // Register F11 for fullscreen toggle
  globalShortcut.register('F11', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  // IPC handler for renderer-triggered fullscreen toggle
  ipcMain.on('toggle-fullscreen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
