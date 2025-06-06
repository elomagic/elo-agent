'use client';

import { BackendResponse, FileMetadata, Project, SourceFile } from '@/shared/Types';

export function chooseAgentFile(initFolder: string | undefined): Promise<string | undefined> {
    return window.ipcRenderer.invoke('choose-agent-file', initFolder);
}

export function chooseFolder(initFolder: string | undefined): Promise<string | undefined> {
    return window.ipcRenderer.invoke('choose-directory', initFolder);
}

export function copyTextToClipboard(text: string): Promise<void> {
    return window.ipcRenderer.invoke('copy-txt-to-clipboard', text);
}

export function deleteProject(projectName: string): Promise<BackendResponse> {
    return window.ipcRenderer.invoke('delete-project', projectName);
}

export function listProjects(): Promise<Project[]> {
    return window.ipcRenderer.invoke('list-projects');
}

export function getJavaProcesses(): Promise<string[]> {
    return window.ipcRenderer.invoke('get-java-processes');
}

export function listFiles(folders: SourceFile[], includeFiles: boolean = false): Promise<FileMetadata[]> {
    return window.ipcRenderer.invoke('list-files', folders, includeFiles);
}

export function updateProject(project: Project): Promise<BackendResponse> {
    return window.ipcRenderer.invoke('update-project', project);
}

export const openFileExternal = (file: string): Promise<void> => {
    return window.ipcRenderer.invoke('open-file-external', file);
}

export function openFolder(folder: string): Promise<void> {
    return window.ipcRenderer.invoke('open-folder', folder);
}

export function readAgentFile(file: string | undefined): Promise<string[]> {
    return window.ipcRenderer.invoke('read-agent-file', file);
}

export function resetAgentFile(file: string): Promise<BackendResponse> {
    return window.ipcRenderer.invoke('reset-agent-file', file);
}
