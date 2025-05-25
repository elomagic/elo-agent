import fs from 'fs';
import path from 'path';
import {dialog, ipcMain, shell} from 'electron';
import {applyRecentAgentFile, applyRecentFolder, getSettings, Settings, writeSettings} from "./appSettings";
import { exec } from 'child_process';

export const chooseDirectory = (defaultFolder: string | undefined) => {
    return dialog.showOpenDialog({
        title: 'Select a folder',
        defaultPath: defaultFolder ?? getSettings().recentFolder,
        properties: ['openDirectory'],
    }).then(result => {
        !result.canceled && applyRecentFolder(result.filePaths[0]);
        return result.canceled ? undefined : result.filePaths[0];
    });
}

export const getJavaProcesses = (): Promise<string[]> => {
    return new Promise<string[]>((resolve) => {
        exec('jps -lv', (err, stdout, _stderr) => {
            if (err) {
                resolve([]);
            }

            const lines = stdout.split('\n').filter(line => line.trim() !== '');

            resolve(lines);
        });
    });
}

const listFilesSync = (folder: string): string[] => {
    if (!fs.statSync(folder).isDirectory()) {
        return [];
    }

    console.info("Scanning folder: " + folder);

    return fs
        .readdirSync(folder)
        .filter((filename) => {
            return (
                (filename.toLowerCase().endsWith('.jar') ||
                    filename.toLowerCase().endsWith('.class'))
            );
        })
        .map((filename) => {
            return path.join(folder, filename);
        });
}

const listFiles = (
    folders: string[],
): Promise<string[]> => {
    const files: string[] = [];

    for (const folder of folders) {
        if (folder === undefined || !fs.statSync(folder).isDirectory()) {
            return Promise.resolve([]);
        }

        files.push(...listFilesSync(folder));
    }

    console.info("Jar files found: " + files.length);

    return Promise.resolve(files);
}

const readFile = (file: string,): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(file, (err2, data: Buffer) => {
            if (err2) {
                reject(err2);
            }
            resolve(data);
        });
    });
}

const readAgentFile = (file: string | undefined): Promise<string[]> => {
    if (!file) {
        return Promise.resolve([]);
    }

    if (!fs.existsSync(file)) {
        return Promise.resolve([]);
    }

    // Datei synchron lesen
    const text = fs.readFileSync(file, 'utf-8');

    // Separe lines  (Supported  \n and \r\n)
    const lines: string[] = text.split(/\r?\n/);

    return Promise.resolve(lines);
}

export const registerMainHandlers = () => {
    ipcMain.handle("copy-txt-to-clipboard", (_event, _text: string): Promise<void> => {
        //clipboard.writeText(text);
        return Promise.resolve();
    })

    ipcMain.handle("list-files", (_event, folder: string[]): Promise<string[]> => {
        return listFiles(folder);
    })

    ipcMain.handle("open-folder", (_event, folder: string): Promise<void> => {
        shell.showItemInFolder(folder)
        return Promise.resolve();
    })

    ipcMain.handle("read-agent-file", (_event, file: string | undefined): Promise<string[]> => {
        return readAgentFile(file);
    })

    ipcMain.handle("read-file", (_event, file: string): Promise<Buffer> => {
        return readFile(file);
    })

    ipcMain.handle("write-settings", (_event): Promise<Settings> => {
        return writeSettings();
    })

    ipcMain.handle("choose-agent-file", (_event, defaultFolder: string | undefined): Promise<string | undefined> => {
        return dialog.showOpenDialog({
            title: 'Select the agent file',
            filters: [{name: 'CSV', extensions: ['csv']}],
            defaultPath: defaultFolder ?? getSettings().recentAgentFile,
            properties: ['openFile'],
        }).then(result => {
            !result.canceled && applyRecentAgentFile(result.filePaths[0]);
            return result.canceled ? undefined : result.filePaths[0];
        });
    })

    ipcMain.handle("choose-directory", (_event, defaultFolder: string | undefined): Promise<string | undefined> => {
        return chooseDirectory(defaultFolder);
    })

}
