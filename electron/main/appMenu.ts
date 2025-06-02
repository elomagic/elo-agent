import {BrowserWindow, Menu, shell} from 'electron';
import {chooseDirectory} from './backendServices';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import MenuItem = Electron.MenuItem;
import {
    getProjectNames,
    loadProject
} from './projects';

export const initAppMenu = (win: BrowserWindow) => {

    const template: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Add Java process (Experimental)',
                    toolTip: 'Try to identify JARs by scanning Java process (Experimental)',
                    click()  {
                        win.webContents.send('show-process-dialog');
                    }
                },
                {
                    label: 'Add directory',
                    toolTip: 'Scans a given directory for JAR files',
                    click() {
                        chooseDirectory(undefined)
                            .then((folder) => folder && win.webContents.send('add-folder', folder, false));
                    }
                },
                {
                    label: 'Add directory recursive',
                    toolTip: 'Scans a given directory recursive for JAR files',
                    click() {
                        chooseDirectory(undefined)
                            .then((folder) => folder && win.webContents.send('add-folder', folder, true));
                    }
                },
                {
                    type: 'separator'
                },
                {
                    id: 'recent-projects',
                    label: 'Recent projects',
                    enabled: getProjectNames().length > 0,
                    submenu: getProjectNames().map((name) => ({
                        label: name,
                        click() { loadProject(win, name) }
                    }))
                },
                {
                    id: 'save-current-project',
                    label: 'Update current project',
                    click() { win.webContents.send('update-project-request') },
                    // enabled: getCurrentProjectName() !== undefined,
                    accelerator: 'CmdOrCtrl+S',
                },
                {
                    label: 'Create as new project',
                    accelerator: 'CmdOrCtrl+N',
                    click() { win.webContents.send('save-new-project-request') }
                },
                {
                    id: 'delete-current-project',
                    label: 'Delete current project',
                    click() { win.webContents.send('delete-project-request') },
                    // enabled: getCurrentProjectName() !== undefined
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    role: 'quit',
                    toolTip: 'Quit this application'
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Search issues',
                    click() {
                        shell.openExternal("https://github.com/elomagic/jr-agent-app/issues")
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'About',
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
