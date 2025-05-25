import { BrowserWindow, Menu, shell } from 'electron';
import { chooseDirectory } from './backendServices';

export const initAppMenu = (win: BrowserWindow) => {

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Add Java process'
        },
        {
          label: 'Add directory'
          ,click() {
            chooseDirectory(undefined)
              .then((folder) => folder && win.webContents.send('add-folders', [folder]));
          }
        },
        {
          label: 'Add directory recursive'
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Search issues',
          click() { shell.openExternal("https://github.com/elomagic/jr-agent-app/issues") }
        },
        /*
        {
          type: 'separator'
        },
        */
        {
          label: 'About',
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}