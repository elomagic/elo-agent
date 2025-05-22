import fs from 'fs';
import path from 'path';
import { ipcMain } from 'electron';
import IpcChannels from '@/shared/IpcChannels';

const listFiles = (
  folder: string | undefined,
): Promise<string[]> => {
  if (folder === undefined || !fs.statSync(folder).isDirectory()) {
    return Promise.resolve([]);
  }
  return Promise.resolve(
    fs
      .readdirSync(folder)
      .filter((filename) => {
        return (
          filename.indexOf('pre') === -1 &&
          (filename.toLowerCase().endsWith('.dicom') ||
            filename.toLowerCase().endsWith('.dicomzip'))
        );
      })
      .map((filename) => {
        return path.join(folder, filename);
      }),
  );
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

ipcMain.handle(IpcChannels.ListFiles, (_event, folder: string) => {
  return listFiles(folder);
})

ipcMain.handle(IpcChannels.ReadFile, (_event, file: string) => {
  return readFile(file);
})

