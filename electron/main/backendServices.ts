import fs from 'fs';
import path from 'path';
import {dialog, ipcMain, shell} from 'electron';
import { applyRecentAgentFile, applyRecentFolder, getSettings } from "./appSettings";
import { spawn } from 'child_process';
import { BackendResponse, Project, SourceFile } from '@/shared/Types';
import { createNewProject, deleteProject, loadProjects, updateProject } from './projects';

export const chooseDirectory = (defaultFolder: string | undefined): Promise<string | undefined> => {
    return dialog.showOpenDialog({
        title: 'Select a folder',
        defaultPath: defaultFolder ?? getSettings().recentFolder,
        properties: ['openDirectory'],
    }).then(result => {
        !result.canceled && applyRecentFolder(result.filePaths[0]);
        return result.canceled ? undefined : result.filePaths[0];
    });
}

export const getJavaProcessesOnWindows: () => Promise<string[]> = () => {
    return new Promise<string[]>((resolve) => {
        // jps or jcmd works only with JDK not with JRE :-/

        const ps = spawn('powershell.exe', [
            '-Command',
            'Get-CimInstance Win32_Process -Filter "Name = \'java.exe\'" | ForEach-Object { $_.ProcessId.ToString() + \' \' + $_.CommandLine }'
        ]);

        let stdout: string = "";

        ps.stdout.on('data', data => {
            stdout += data;
        });

        ps.on('exit', _code => {
            const lines = stdout.trim().split('\n').filter(line => line.trim() !== '');
            resolve(lines);
        });
    });
}

export const getJavaProcessesOnMac: () => Promise<string[]> = () => {
    // TODO Mac support
    // ps -x -o pid=,command=
    return Promise.resolve(["Currently not supported on Mac"]);
}

export const getJavaProcessesOnLinux: () => Promise<string[]> = () => {
    // TODO Linux support
    // ps -x -o pid=,command=
    return Promise.resolve(["Currently not supported on Mac"]);
}

export const getJavaProcesses = (): Promise<string[]> => {
    if (process.platform === 'win32') {
        return getJavaProcessesOnWindows();
    } else if (process.platform === 'darwin') {
        return getJavaProcessesOnMac();
    } else if (process.platform === 'linux') {
        return getJavaProcessesOnLinux();
    } else {
        return Promise.resolve(["Unsupported platform: " + process.platform]);
    }
}

const listFilesSync = (sourceFile: SourceFile): string[] => {
    if (!fs.statSync(sourceFile.file).isDirectory()) {
        return [];
    }

    console.info("Scanning folder: " + sourceFile.file + " recursively: " + sourceFile.recursive);

    const files = fs.readdirSync(sourceFile.file)
        .map((filename) => {
            return path.join(sourceFile.file, filename);
        });

    const result = [];

    for (const file of files) {
        if (fs.statSync(file).isDirectory() && sourceFile.recursive) {
            result.push(...listFilesSync({ file: file + path.sep, recursive: sourceFile.recursive }));
        } else if (file.toLowerCase().endsWith('.jar')) {
            result.push(file)
        }
    }

    return result;
}

const listFiles = (
    files: SourceFile[],
    includeFiles: boolean,
): Promise<string[]> => {
    const collectedFiles: string[] = [];

    for (const file of files) {
        if (file === undefined) {
            continue;
        }

        if (fs.statSync(file.file).isDirectory()) {
            collectedFiles.push(...listFilesSync(file));
        } else if (includeFiles) {
            collectedFiles.push(file.file);
        }
    }

    console.info("Count of files found: " + collectedFiles.length);

    return Promise.resolve(collectedFiles);
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

const resetAgentFile = (file: string): Promise<BackendResponse> => {
    if (!fs.existsSync(file)) {
        return Promise.resolve({ responseMessage: `Agent file '${file}' not found`});
    }

    // Append current timestamp to the file name
    const newFilename = file + '.' + new Date().toISOString().replace(/[:.]/g, '-') + '.bak';
    fs.renameSync(file, newFilename);

    return Promise.resolve({ responseMessage: 'Agent file successful reset.' });
}

export const registerMainHandlers = () => {
    ipcMain.handle("copy-txt-to-clipboard", (_event, _text: string): Promise<void> => {
        // todo clipboard.writeText(text);
        return Promise.resolve();
    })

    ipcMain.handle("create-new-project", (_event, project: Project): Promise<BackendResponse> => {
        return createNewProject(project);
    })

    ipcMain.handle("delete-project", (_event, projectName: string): Promise<BackendResponse> => {
        return deleteProject(projectName);
    })

    ipcMain.handle("get-java-processes", (_event): Promise<string[]> => {
        return getJavaProcesses();
    })

    ipcMain.handle("list-files", (_event,
                                  folder: SourceFile[],
                                  includeFiles: boolean): Promise<string[]> => {
        return listFiles(folder, includeFiles);
    })

    ipcMain.handle("list-projects", (_event): Promise<Project[]> => {
        return new Promise((resolve) => resolve(loadProjects()));
    })

    ipcMain.handle("open-file-external", (_event, file: string): Promise<void> => {
        return shell.openExternal(file);
    })

    ipcMain.handle("open-folder", (_event, folder: string): Promise<void> => {
        shell.showItemInFolder(folder)
        return Promise.resolve();
    })

    ipcMain.handle("read-agent-file", (_event, file: string | undefined): Promise<string[]> => {
        return readAgentFile(file);
    })

    ipcMain.handle("reset-agent-file", (_event, file: string): Promise<BackendResponse> => {
        return resetAgentFile(file);
    })

    ipcMain.handle("read-file", (_event, file: string): Promise<Buffer> => {
        return readFile(file);
    })

    ipcMain.handle("update-project", (_event, project: Project): Promise<BackendResponse> => {
        return updateProject(project);
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
