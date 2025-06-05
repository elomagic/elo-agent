import path from 'node:path';
import { getUserHomeAppPath } from './appSettings';
import fs from 'fs';
import logger from 'electron-log/main';
import { BackendResponse, Project } from '@/shared/Types';
import {app, BrowserWindow } from 'electron';

const WINDOWS_TITLE = "elo Agent"

const getProjectsFilename = (): string => {
    return path.join(getUserHomeAppPath(), 'projects.json');
};

export const loadProjects = (): Project[] => {
    const fn = getProjectsFilename();
    if (fs.existsSync(fn)) {
        logger.info('Reading projects file: ', fn);
        const content = fs.readFileSync(fn, 'utf8');
        return JSON.parse(content) as Project[];
    }

    return [];
}

const saveProjects = (projects: Project[]): Promise<BackendResponse> => {
    const fn = getProjectsFilename();
    logger.info('Writing projects file: ', fn);
    const json = JSON.stringify(projects, null, 2);

    return new Promise<BackendResponse>((resolve) => {
        if (!fs.existsSync(getUserHomeAppPath())) {
            fs.mkdirSync(getUserHomeAppPath());
        }

        fs.writeFile(fn, json, {encoding: 'utf8'}, () => {
            resolve({ responseMessage: 'Project successful saved'});
        });
    });
}

export const updateProject = (project: Project) => {
    const p: Project[] = loadProjects().filter(item => item.name !== project.name).concat(project);
    return saveProjects(p);
}

export const deleteProject = (projectName: string) => {
    console.info(`Deleting project '${projectName}'`);

    const p = loadProjects().filter(project => project.name !== projectName);

    const win = BrowserWindow.getFocusedWindow();
    win && win.setTitle(`${WINDOWS_TITLE} ${app.getVersion()}`);

    return saveProjects(p);
}