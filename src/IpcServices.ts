"use client"

export function chooseAgentFile(initFolder: string): Promise<string | undefined> {
  return window.ipcRenderer.invoke("choose-agent-file", initFolder)
}

export function chooseFolder(initFolder: string): Promise<string | undefined> {
  return window.ipcRenderer.invoke('choose-directory', initFolder)
}

export function listFiles(folders: string[]): Promise<string[]> {
  return window.ipcRenderer.invoke('list-files', folders)
}

export function readAgentFile(file: string): Promise<string[]> {
  return window.ipcRenderer.invoke('read-agent-file', file)
}

export function readFile(file: string): Promise<Buffer> {
  return window.ipcRenderer.invoke('read-file', file)
}
