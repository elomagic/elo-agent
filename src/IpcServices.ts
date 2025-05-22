import IpcChannels from "./shared/IpcChannels";
import OpenDialogReturnValue = Electron.OpenDialogReturnValue;

export const listFiles = (folder: string): Promise<string[]> => {
  return window.ipcRenderer.invoke(IpcChannels.ListFiles, folder);
}

export const readFile = (file: string): Promise<Buffer> => {
  return window.ipcRenderer.invoke(IpcChannels.ReadFile, file)
}

export const openFolder = (initDirectory: string | (() => string) | undefined, ): Promise<OpenDialogReturnValue> => {
  return window.ipcRenderer.invoke(IpcChannels.ChooseDirectory, initDirectory);
}

