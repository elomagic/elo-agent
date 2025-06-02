import path from 'node:path';
import { getUserHomeAppPath } from './appSettings';
import fs from 'fs';
import logger from 'electron-log/main';
import { BackendResponse, Project } from '@/shared/Types';
import { BrowserWindow, Menu } from 'electron';
import MenuItem = Electron.MenuItem;

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

export const getProjectNames = (): string[] => {
    return loadProjects().map((project) => project.name);
}

const findMenuItem = (items: MenuItem[]) => {
    for (let item of items) {
        if (item.id === 'recent-projects') {
            return item;
        } else if (item.submenu !== undefined) {
            return findMenuItem(item.submenu.items)
        }
    }

    return undefined;
}

const updateRecentMenu = () => {
    const items = Menu.getApplicationMenu()?.items;
    if (items === undefined) {
        return
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
        return;
    }
    const menu = findMenuItem(items);
    /*
    menu.submenu = getProjectNames().map((name) => ({
        label: name,
        click() { loadProject(win, name) }
    }))

     */
    console.log(menu);
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

        // TODO win.setTitle(p.name);
    }
}

export const deleteProject = (projectName: string) => {
    console.info("Deleting project " + projectName);

    const p = loadProjects().filter(project => project.name !== projectName);

    // const win = BrowserWindow.getFocusedWindow();
    // TODO win && win.setTitle("BLABABL")
    updateRecentMenu();

    return saveProjects(p);
}