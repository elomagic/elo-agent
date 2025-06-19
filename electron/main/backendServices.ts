import fs from 'fs';
import path from 'path';
import { app, dialog, ipcMain, shell } from 'electron';
import { applyRecentAgentFile, applyRecentFolder, getSettings } from './appSettings';
import { spawn } from 'child_process';
import {
    AgentFileMetadata,
    BackendResponse,
    FileMetadata,
    FolderFilter,
    ImportProgress,
    ImportType,
    Project,
    SourceFile
} from '../../src/shared/Types';
import { deleteProject, loadProjects, updateProject } from './projects';
import JSZip from 'jszip';
import WebContents = Electron.WebContents;
import { parse } from 'dot-properties';

const sendProgress = (webContents: WebContents, progress: ImportProgress): void => {
    webContents.send("import-progress", progress);
}

const chooseDirectory = (defaultFolder: string | undefined): Promise<string | undefined> => {
    return dialog.showOpenDialog({
        title: 'Select a folder',
        defaultPath: defaultFolder ?? getSettings().recentFolder,
        properties: ['openDirectory'],
    }).then(result => {
        !result.canceled && applyRecentFolder(result.filePaths[0]);
        return result.canceled ? undefined : result.filePaths[0];
    });
}

const getJavaProcessesOnWindows: () => Promise<string[]> = () => {
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

const getJavaProcessesOnMac: () => Promise<string[]> = () => {
    // TODO Mac support
    // ps -x -o pid=,command=
    return Promise.resolve(["Currently not supported on Mac"]);
}

const getJavaProcessesOnLinux: () => Promise<string[]> = () => {
    // TODO Linux support
    // ps -x -o pid=,command=
    return Promise.resolve(["Currently not supported on Mac"]);
}

const getPurlsOfFile = (file: string, webContents: WebContents): Promise<string[]> => {
    // Get all pom.properties files which is placed in a subfolder of the in the META-INF of a zipped jar file.
    // The content of the pom.properties file is used to create a purl.
    // As method will return an array of purls or undefined if no pom.properties file is found.
    if (!file || !fs.existsSync(file)) {
        return Promise.resolve([]);
    }

    if (!file.toLowerCase().endsWith('.jar')) {
        return Promise.resolve([]);
    }

    // Read the jar file
    const jarFile = fs.readFileSync(file);

    sendProgress(webContents, { file: file.replaceAll("\\", "/"), type: ImportType.Analyze });

    // Check if the jar file contains a META-INF folder
    const jar = new JSZip();

    return jar.loadAsync(jarFile).then(zip => {
        const purls: string[] = [];
        const promises: Promise<void>[] = [];

        // Iterate over all files in the jar
        Object.keys(zip.files).forEach((filename) => {
            if (filename.toLowerCase().endsWith('pom.properties')) {
                // Read the content of the pom.properties file
                const promise = zip.file(filename)?.async('string').then(content => {
                    const properties = parse(content);

                    // Parse the content to create a purl
                    const groupId = properties['groupId'];
                    const artifactId = properties['artifactId'];
                    const version = properties['version'];

                    if (groupId && artifactId && version) {
                        const purl = `pkg:maven/${groupId}/${artifactId}@${version}`;
                        purls.push(purl);
                    }
                });
                if (promise) {
                    promises.push(promise);
                }
            }
        });

        return Promise.all(promises).then(() => purls);
    });
}

const getJavaProcesses = (): Promise<string[]> => {
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

const listFilesSync = (sourceFile: SourceFile): FileMetadata[] => {
    if (!fs.statSync(sourceFile.file).isDirectory()) {
        return [];
    }

    console.info("Scanning folder: " + sourceFile.file + " recursively: " + sourceFile.recursive);

    const files = fs.readdirSync(sourceFile.file)
        .map((filename) => {
            return path.join(sourceFile.file, filename);
        });

    const result: FileMetadata[] = [];

    for (const file of files) {
        if (fs.statSync(file).isDirectory() && sourceFile.recursive) {
            result.push(...listFilesSync({ file: file + path.sep, recursive: sourceFile.recursive, filter: sourceFile.filter }));
        } else if (file.toLowerCase().endsWith('.jar')) {
            result.push({ file, purls: []} )
        }
    }

    return result;
}

const listFiles = (files: SourceFile[], webContents: WebContents): Promise<FileMetadata[]> => {
    let collectedFiles: FileMetadata[] = [];

    for (const file of files) {
        // Ignore exclude filter in this step because we want to collect all files first
        if (file.filter === FolderFilter.ExcludeFolderRecursive) {
            continue;
        }

        if (fs.statSync(file.file).isDirectory()) {
            collectedFiles.push(...listFilesSync(file));
        } else {
            collectedFiles.push({ file: file.file, purls: [] });
        }
    }

    // Exclude filter
    for (const file of files) {
        if (file.filter !== FolderFilter.ExcludeFolderRecursive) {
            continue;
        }

        collectedFiles = collectedFiles.filter(f => !f.file.replaceAll("\\", "/").startsWith(file.file.replaceAll("\\", "/")));
    }

    console.info("Count of files found: " + collectedFiles.length);
    console.debug("Identifying purls...");

    // Get purls for each file
    return Promise.all(collectedFiles.map((f) => {
        return getPurlsOfFile(f.file, webContents).then(purls => {
            f.purls = purls;
            return f;
        });
    }));
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

const readAgentFile = (file: string | undefined, webContents: WebContents): Promise<AgentFileMetadata[]> => {
    if (!file) {
        return Promise.resolve([]);
    }

    if (!fs.existsSync(file)) {
        return Promise.resolve([]);
    }

    // Datei synchron lesen
    const text = fs.readFileSync(file, 'utf8');

    // Separe lines  (Supported  \n and \r\n)
    const lines: string[] = text.split(/\r?\n/).filter(l => l.trim() !== '');

    const meta: AgentFileMetadata[] = lines.map(line => {
        const columns = line.split(";")
        return {
            timeInMs: Number(columns[0]),
            file: columns[1],
            elapsedTime: columns.length > 2 ? Number(columns[2]) : undefined,
            purls: []
        }
    });

    // Get purls for each file
    return Promise.all(meta.map((m) => {
        return getPurlsOfFile(m.file, webContents).then(purls => {
            m.purls = purls;
            return m;
        });
    }));
}

export const registerMainHandlers = () => {
    ipcMain.handle("copy-txt-to-clipboard", (_event, _text: string): Promise<void> => {
        // todo clipboard.writeText(text);
        return Promise.resolve();
    })

    ipcMain.handle("delete-project", (_event, projectName: string): Promise<BackendResponse> => {
        return deleteProject(projectName);
    })

    ipcMain.handle("get-java-processes", (_event): Promise<string[]> => {
        return getJavaProcesses();
    })

    ipcMain.handle("get-application-version", (_event): Promise<string | undefined> => {
        return Promise.resolve(app.getVersion());
    })

    ipcMain.handle("list-files", (event, folder: SourceFile[]): Promise<FileMetadata[]> => {
        return listFiles(folder, event.sender);
    })

    ipcMain.handle("list-projects", (_event): Promise<Project[]> => {
        return Promise.resolve(loadProjects());
    })

    ipcMain.handle("open-file-external", (_event, file: string): Promise<void> => {
        return shell.openExternal(file);
    })

    ipcMain.handle("open-folder", (_event, folder: string): Promise<void> => {
        shell.showItemInFolder(folder)
        return Promise.resolve();
    })

    ipcMain.handle("read-agent-file", (event, file: string | undefined): Promise<AgentFileMetadata[]> => {
        return readAgentFile(file, event.sender);
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
