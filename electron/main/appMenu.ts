import {BrowserWindow, Menu, shell} from 'electron';
import {chooseDirectory} from './backendServices';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import MenuItem = Electron.MenuItem;

export const initAppMenu = (win: BrowserWindow) => {

    const template: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
        {
            label: 'elo Agent',
            submenu: [
                {
                    label: 'About',
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
            label: 'Sources',
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
                    label: 'Reload sources and agent file',
                    click()  {
                        win.webContents.send('reload-request');
                    },
                    accelerator: 'CmdOrCtrl+R',
                },
            ]
        },
        {
            label: 'Projects',
            submenu: [
                {
                    id: 'save-current-project',
                    label: 'Update current project',
                    click() { win.webContents.send('update-project-request') },
                    // enabled: getCurrentProjectName() !== undefined,
                    accelerator: 'CmdOrCtrl+S',
                },
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
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
