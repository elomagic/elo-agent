import {Menu} from 'electron';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import MenuItem = Electron.MenuItem;

export const createAppMenu = () => {

    const template: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
        {
            label: 'elo Agent',
            submenu: [
                {
                    label: 'Quit',
                    role: 'quit',
                    toolTip: 'Quit this application'
                }
            ]
        }
    ]

    return Menu.buildFromTemplate(template)
}
