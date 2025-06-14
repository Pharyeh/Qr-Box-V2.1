import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';


let backendProcess;

function startBackend() {
  // Use node executable and point to server/server.js
  const serverPath = join(__dirname, '..', 'server', 'server.js');
  backendProcess = spawn(
    process.platform === 'win32' ? 'node.exe' : 'node',
    [serverPath],
    {
      cwd: join(__dirname, '..', 'server'),
      stdio: 'ignore', // or 'inherit' to see logs
      detached: true
    }
  );
  backendProcess.unref();
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: join(__dirname, 'src', 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, 'dist', 'index.html'));
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle IPC events
ipcMain.on('toggle-fullscreen', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win.isFullScreen()) {
    win.setFullScreen(false);
  } else {
    win.setFullScreen(true);
  }
}); 