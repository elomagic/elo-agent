const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {

  listFiles: (folder: string): Promise<string[]> => ipcRenderer.invoke('list-files', folder),

  readFile: (file: string): Promise<Buffer> => ipcRenderer.invoke('read-file', file),

  chooseFolder: (initDirectory: string | (() => string) | undefined, ): Promise<string | undefined> => ipcRenderer.invoke('choose-directory', initDirectory),

})
