import {Menu, shell} from 'electron';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import MenuItem = Electron.MenuItem;

export const initAppMenu = () => {

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
