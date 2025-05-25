import logger from 'electron-log/main';
import fs from "fs";
import path from "node:path";
import {app} from "electron";

export function getUserHomeAppPath(): string {
    return path.join(app.getPath('home'), '.elo-java-agent');
}
 
export type Settings = {
    recentFolder: string;
    recentAgentFile: string;
};

export const defaultConfiguration = (): Settings => {
    return {
        recentFolder: "./libs",
        recentAgentFile: "./elo-agent-file.csv",
    };
};

const getFilename = (): string => {
    return path.join(getUserHomeAppPath(), 'settings.json');
};

let settingsCache: Settings;

export const getSettings = () => {
    return settingsCache;
};

export const writeSettings = (): Promise<Settings> => {
    logger.log('Writing settings file: ', getFilename());
    const json = JSON.stringify(settingsCache, null, 2);
    return new Promise<Settings>((resolve) => {
        if (!fs.existsSync(getUserHomeAppPath())) {
            fs.mkdirSync(getUserHomeAppPath());
        }

        fs.writeFile(getFilename(), json, {encoding: 'utf8'}, () => {
            resolve(settingsCache);
        });
    });
};

export const readSettings = (): Settings => {
    if (settingsCache === undefined) {
        if (fs.existsSync(getFilename())) {
            logger.log('Reading settings file: ', getFilename());
            const content = fs.readFileSync(getFilename(), 'utf8');
            settingsCache = JSON.parse(content) as Settings;
        } else {
            settingsCache = defaultConfiguration();
            logger.log('Creating new settings file');
            writeSettings().catch((ex) => logger.error(ex));
        }
    }

    return settingsCache;
};

readSettings();
