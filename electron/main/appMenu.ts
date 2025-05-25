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
                    click()  {
                        getJavaProcesses().then((processes) => win.webContents.send('choose-processes', processes));
                    }
                },
                {
                    label: 'Add directory',
                    click() {
                        chooseDirectory(undefined)
                            .then((folder) => folder && win.webContents.send('add-folders', [folder]));
                    }
                },
                {
                    label: 'Add directory recursive',
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    role: 'quit'
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
