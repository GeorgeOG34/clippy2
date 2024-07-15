// Modules to control application life and create native browser window
const { app, BrowserWindow, screen, desktopCapturer } = require('electron')
const path = require('node:path')
const {
  user32FindWindowEx,
  winspoolGetDefaultPrinter
} = require('win32-api/fun')
const { Kernel32, User32 } = require('win32-api/promise');
const { spawn } = require('node:child_process')
const user32 = User32.load();

let mainWindow;

async function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: screen.getPrimaryDisplay().bounds.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true
    },
    transparent: true,
    frame: false,
    alwaysOnTop: true
  })


  // mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setFocusable(false);
  mainWindow.setResizable(false);
  let display = screen.getPrimaryDisplay();
  let width = display.bounds.width;
  mainWindow.setPosition(display.bounds.width - mainWindow.getSize()[0], display.bounds.height - mainWindow.getSize()[1])
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // spawn(`C:/Program Files/Google/Chrome/Application/chrome.exe`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  //TODO:
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
   * https://stackoverflow.com/questions/60732227/how-to-grant-permission-to-audio-in-electron-app-in-windows
   * https://www.electronjs.org/docs/latest/api/desktop-capturer
   * https://www.tutorialspoint.com/electron/electron_audio_and_video_capturing.htm
   * https://www.electronjs.org/docs/latest/api/system-preferences#systempreferencesaskformediaaccessmediatype-macos
   */


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
  //   console.log("gi");
  //   for (const source of sources) {
  //     console.log(source);
  //     if (source.name === 'Electron') {
  //       // mainWindow.webContents.send('SET-_SOURCE', source.id)
  //       return
  //     }
  //   }
  // })
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
