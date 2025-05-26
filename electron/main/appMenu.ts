import {BrowserWindow, Menu, shell} from 'electron';
import {chooseDirectory, getJavaProcesses} from './backendServices';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import MenuItem = Electron.MenuItem;

export const initAppMenu = (win: BrowserWindow) => {

    const template: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Add Java process',
                    toolTip: 'Try to identify JARs by scanning Java process (Experimental)',
                    click()  {
                        getJavaProcesses().then((processes) => win.webContents.send('choose-processes', processes));
                    }
                },
                {
                    label: 'Add directory',
                    toolTip: 'Scans a given directory for JAR files',
                    click() {
                        chooseDirectory(undefined)
                            .then((folder) => folder && win.webContents.send('add-folders', [folder]));
                    }
                },
                {
                    label: 'Add directory recursive',
                    toolTip: 'Scans a given directory recursive for JAR files',
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
