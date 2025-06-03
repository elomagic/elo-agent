import path from 'node:path';
import { getUserHomeAppPath } from './appSettings';
import fs from 'fs';
import logger from 'electron-log/main';
import { BackendResponse, Project } from '@/shared/Types';
import {app, BrowserWindow, Menu } from 'electron';
import MenuItem = Electron.MenuItem;
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

const WINDOWS_TITLE = "elo Agent"

const getProjectsFilename = (): string => {
    return path.join(getUserHomeAppPath(), 'projects.json');
};

const loadProjects = (): Project[] => {
    const fn = getProjectsFilename();
    if (fs.existsSync(fn)) {
        logger.info('Reading projects file: ', fn);
        const content = fs.readFileSync(fn, 'utf8');
        return JSON.parse(content) as Project[];
    }

    return [];
}

const findMenuItem = (items: MenuItem[]): MenuItem | undefined => {
    for (let item of items) {
        if (item.id === 'recent-projects') {
            return item;
        } else if (item.submenu) {
            const result = findMenuItem(item.submenu.items)
            if (result) {
                return result
            }
        }
    }

    return undefined;
}

const updateRecentMenu = (projects: Project[]) => {
    const items = Menu.getApplicationMenu()?.items;
    if (items === undefined) {
        return
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
        return;
    }
    const menu: MenuItem | undefined = findMenuItem(items);

    if (menu === undefined) {
        return;
    }

    const newMenuItems: MenuItemConstructorOptions[] = projects.map((p) => ({
        label: p.name,
        click() { loadProject(win, p.name) }
    }));

    menu.submenu = Menu.buildFromTemplate(newMenuItems);
}

const saveProjects = (projects: Project[]): Promise<BackendResponse> => {
    const fn = getProjectsFilename();
    logger.info('Writing projects file: ', fn);
    const json = JSON.stringify(projects, null, 2);

    updateRecentMenu(projects);

    return new Promise<BackendResponse>((resolve) => {
        if (!fs.existsSync(getUserHomeAppPath())) {
            fs.mkdirSync(getUserHomeAppPath());
        }

        fs.writeFile(fn, json, {encoding: 'utf8'}, () => {
            resolve({ responseMessage: 'Project successful saved'});
        });
    });
}

export const getProjectNames = (): string[] => {
    return loadProjects().map((project) => project.name);
}

export const createNewProject = (project: Project) => {
    const p = loadProjects().filter(item => item.name !== project.name).concat(project);
    return saveProjects(p);
}

export const updateProject = (project: Project) => {
    const p: Project[] = loadProjects().filter(item => item.name !== project.name).concat(project);
    return saveProjects(p);
}

export const loadProject = (win: BrowserWindow, projectName: string) => {
    const ps = loadProjects().filter((p) => p.name === projectName);
    if (ps && ps.length > 0) {
        const p = ps[0]
        win.webContents.send('load-project-request', p);

        win.setTitle(`${WINDOWS_TITLE} ${app.getVersion()} - Project ${projectName}`);
    }
}

export const deleteProject = (projectName: string) => {
    console.info("Deleting project " + projectName);

    const p = loadProjects().filter(project => project.name !== projectName);

    const win = BrowserWindow.getFocusedWindow();
    win && win.setTitle(`${WINDOWS_TITLE} ${app.getVersion()}`);

    return saveProjects(p);
}