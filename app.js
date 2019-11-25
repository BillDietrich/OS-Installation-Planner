//---------------------------------------------------------------------------
// "OS Installation Planner" app.js
// Runs in Electron main process
//---------------------------------------------------------------------------


const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')
const url = require('url')


//---------------------------------------------------------------------------

let window = null


//---------------------------------------------------------------------------
// top frame Menus
// https://www.tutorialspoint.com/electron/electron_menus.htm
function createTopMenus() {

   const template = [
      {
         label: 'File',
         submenu: [
            { role: 'quit' }         
         ]
      },
      {
         label: 'Edit',
         submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' }
         ]
      },
      {
         label: 'View',
         submenu: [
            { role: 'reload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
         ]
      },
      {
         role: 'window',
         submenu: [
            { role: 'minimize' },
            { role: 'close' }
         ]
      },
      {
         role: 'help',
         submenu: [
            { label: 'Learn More' }
         ]
      }
   ]

   const menu = Menu.buildFromTemplate(template)
   Menu.setApplicationMenu(menu)
}



if (true) {
   createTopMenus();
}

//---------------------------------------------------------------------------


// https://github.com/electron/electron/blob/master/docs/api/app.md
// app.setAboutPanelOptions(options)


//---------------------------------------------------------------------------


// https://electronjs.org/docs/api/ipc-main
// Attach listener in the main process with the given ID
ipcMain.on('context-menu', (event, arg) => {
    // Displays the object sent from the renderer process:
    //{
    //    message: "Hi",
    //    someData: "Let's go"
    //}
    // THIS MESSAGE COMES OUT ON THE TERMINAL WINDOW, NOT THE DEVTOOLS CONSOLE !!!
    console.log(
        arg
    );
});



//---------------------------------------------------------------------------

// Wait until the app is ready
app.once('ready', () => {

  // Create a new window
  // https://electronjs.org/docs/api/browser-window
  window = new BrowserWindow({
    // Set the initial width in px
    width: 1100,
    // Set the initial height in px
    height: 650,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#D6D8DC",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,
    webPreferences: { devTools: true, nodeIntegration: true },
    icon: __dirname + '/osinstallationplanner-128x68.png'
  })

  // packaging the app:
  // use electron-packager and set the icon using the --icon switch
  // use https://iconverticons.com/online/ to convert png to icns for OS X
  // arrow from https://gallery.yopriceville.com/Free-Clipart-Pictures/Arrows-PNG/Green_Right_Arrow_Transparent_PNG_Clip_Art_Image

  // Load a URL in the window to the local index.html path
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Show window when page is ready
  window.once('ready-to-show', () => {
    window.show()
  })
})


//---------------------------------------------------------------------------
