"use client"

export function chooseAgentFile(initFolder: string | undefined): Promise<string | undefined> {
    return window.ipcRenderer.invoke("choose-agent-file", initFolder)
}

export function chooseFolder(initFolder: string | undefined): Promise<string | undefined> {
    return window.ipcRenderer.invoke('choose-directory', initFolder)
}

export function copyTextToClipboard(text: string) {
    window.ipcRenderer.invoke('copy-txt-to-clipboard', text)
}

export function listFiles(folders: string[]): Promise<string[]> {
    return window.ipcRenderer.invoke('list-files', folders)
}

export function openFolder(folder: string) {
    window.ipcRenderer.invoke('open-folder', folder)
}

export function readAgentFile(file: string | undefined): Promise<string[]> {
    return window.ipcRenderer.invoke('read-agent-file', file)
}

export function readFile(file: string): Promise<Buffer> {
    return window.ipcRenderer.invoke('read-file', file)
}
