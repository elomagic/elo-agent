import {BrowserWindow, Menu, shell} from 'electron';
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
