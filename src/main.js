const { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, Tray } = require('electron');
const path = require('node:path');
const { NoteStore } = require('./note-store');

let mainWindow;
let tray;
let store;
let isQuitting = false;

function showWidget({ focusComposer = false } = {}) {
  if (!mainWindow) return;
  mainWindow.show();
  mainWindow.focus();
  if (focusComposer) mainWindow.webContents.send('focus-composer');
}

function createTray() {
  // Windows notification-area rendering is unreliable for SVG files. Use the
  // raster app icon here so the tray never falls back to a blank white tile.
  const icon = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', 'app-icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('每日索引');
  const refreshMenu = () => {
    const { alwaysOnTop } = store.getSettings();
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '显示挂件', click: () => showWidget() },
      { label: '新建 Note', click: () => showWidget({ focusComposer: true }) },
      { type: 'separator' },
      {
        label: '始终置顶',
        type: 'checkbox',
        checked: alwaysOnTop,
        click: (item) => setAlwaysOnTop(item.checked)
      },
      { type: 'separator' },
      { label: '退出每日索引', click: () => { isQuitting = true; app.quit(); } }
    ]));
  };
  tray.on('click', () => showWidget());
  tray.on('right-click', refreshMenu);
  refreshMenu();
}

function setAlwaysOnTop(value) {
  const settings = store.updateSettings({ alwaysOnTop: Boolean(value) });
  mainWindow?.setAlwaysOnTop(settings.alwaysOnTop);
  return settings;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 510,
    height: 650,
    minWidth: 390,
    minHeight: 480,
    frame: false,
    icon: path.join(__dirname, '..', 'assets', 'app-icon.png'),
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.setAlwaysOnTop(store.getSettings().alwaysOnTop);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();
  });
}

function registerIpc() {
  ipcMain.handle('notes:list', (_event, options) => store.listNotes(options));
  ipcMain.handle('notes:search', (_event, query, options) => store.searchNotes(query, options));
  ipcMain.handle('notes:create', (_event, content) => store.createNote(content));
  ipcMain.handle('notes:create-child', (_event, parentId, content) => store.createChild(parentId, content));
  ipcMain.handle('notes:update', (_event, id, content) => store.updateNote(id, content));
  ipcMain.handle('notes:toggle', (_event, id) => store.toggleNote(id));
  ipcMain.handle('notes:delete', (_event, id) => store.deleteNote(id));
  ipcMain.handle('settings:get', () => store.getSettings());
  ipcMain.handle('settings:always-on-top', (_event, value) => setAlwaysOnTop(value));
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:hide', () => mainWindow?.hide());
  ipcMain.on('window:focus-composer', () => showWidget({ focusComposer: true }));
}

app.whenReady().then(() => {
  store = new NoteStore(path.join(app.getPath('userData'), 'notes.json'));
  registerIpc();
  createWindow();
  createTray();
  globalShortcut.register('Control+Alt+Space', () => {
    if (mainWindow?.isVisible()) mainWindow.hide();
    else showWidget({ focusComposer: true });
  });
  app.on('activate', () => showWidget());
});

app.on('window-all-closed', (event) => event.preventDefault());
app.on('before-quit', () => { isQuitting = true; globalShortcut.unregisterAll(); });
