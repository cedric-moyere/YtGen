const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

try {
  require("electron-reloader")(module);
} catch (_) {}

let mainWindow;

function initialize() {
  makeSingleInstance();
  loadMainProcess();

  function createWindow() {
    const windowOptions = {
      show: false,
      useContentSize: true,
      autoHideMenuBar: true,
      width: 680,
      height: 400,
      title: app.getName(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    };
    mainWindow = new BrowserWindow(windowOptions);
    // mainWindow.webContents.openDevTools();
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.once("ready-to-show", () => mainWindow.show());
    mainWindow.on("closed", () => {
      app.quit();
    });
    remoteMain.enable(mainWindow.webContents);

    globalShortcut.register("F5", () => mainWindow.reload());
  }

  app.disableHardwareAcceleration();

  app.on("ready", () => createWindow());
  app.on("window-all-closed", () => {
    process.platform !== "darwin" && app.quit();
  });
  app.on("activate", () => {
    !mainWindow && createWindow();
  });
}

function makeSingleInstance() {
  if (process.mas) return;
  app.requestSingleInstanceLock();
  app.on("second-instance", () => {
    mainWindow.isMinimized() && mainWindow.restore();
    mainWindow.focus();
  });
}

function loadMainProcess() {
  const directoryPath = path.join(__dirname, "main-process/");
  fs.readdir(directoryPath, (err, files) => {
    err && console.log(err);
    files.forEach((file) => {
      require(`${directoryPath}${file}`);
    });
  });
}

initialize();
