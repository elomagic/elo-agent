import fs from 'fs';
import path from 'path';
import { dialog, ipcMain } from 'electron';

const listFilesSync = (
  folder: string,
): string[] => {
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

const readAgentFile = (file: string): Promise<string[]> => {
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
  ipcMain.handle("list-files", (_event, folder: string[]): Promise<string[]> => {
    return listFiles(folder);
  })

  ipcMain.handle("read-agent-file", (_event, file: string): Promise<string[]> => {
    return readAgentFile(file);
  })

  ipcMain.handle("read-file", (_event, file: string): Promise<Buffer> => {
    return readFile(file);
  })

  ipcMain.handle("choose-directory", (_event, defaultFolder: string): Promise<string | undefined> => {
    return dialog.showOpenDialog({
      title: 'Select a folder',
      defaultPath: defaultFolder,
      properties: ['openDirectory'],
    }).then(result => result.canceled ? undefined : result.filePaths[0]);
  })
}
