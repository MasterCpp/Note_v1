const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ideaAPI', {
  listNotes: (options) => ipcRenderer.invoke('notes:list', options),
  searchNotes: (query, options) => ipcRenderer.invoke('notes:search', query, options),
  createNote: (content) => ipcRenderer.invoke('notes:create', content),
  createChild: (parentId, content) => ipcRenderer.invoke('notes:create-child', parentId, content),
  updateNote: (id, content) => ipcRenderer.invoke('notes:update', id, content),
  toggleNote: (id) => ipcRenderer.invoke('notes:toggle', id),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('settings:always-on-top', value),
  minimize: () => ipcRenderer.send('window:minimize'),
  hide: () => ipcRenderer.send('window:hide'),
  onFocusComposer: (callback) => ipcRenderer.on('focus-composer', callback)
});
