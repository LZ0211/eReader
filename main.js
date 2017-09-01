const {app,BrowserWindow,dialog} = require('electron')

const path = require('path')
const fs = require('fs')
const url = require('url')
const os = require('os')
const Wedge = require('Wedge')
const utils = require('./utils.js')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let wedgeApp
let VERSION = 0.1
let appConfig = {
    librarys:[],
    defaultLibrary:''
}

function initAppData(){
    let appDataPath = path.join(os.homedir(),'.eReader')
    try{
        let rawData = fs.readFileSync(appDataPath)
        //read app config
        appConfig =Object.assign(appConfig,JSON.parse(rawData.toString()))
    }catch(e){
        //do Nothing
    }
}

function saveAppData(){
    let appDataPath = path.join(os.homedir(),'.eReader')
    try{
      fs.writeFileSync(appDataPath,JSON.stringify(appConfig,null,2))
    }catch(e){
      //do nothing
    }
}

function createNewLibrary(){
  dialog.showOpenDialog(mainWindow,{
    title: 'Please select a folder as the library directory',
    defaultPath: path.join(os.homedir(),'Documents'),
    properties: [ 'openDirectory','createDirectory']
  },dirArr=>{
    if(!dirArr){
      if(appConfig.librarys.length){
        appConfig.defaultLibrary = appConfig.librarys[0]
      }else{
        return createNewLibrary()
      }
    }else{
      let library = dirArr[0]
      if(!~appConfig.librarys.indexOf(library)){
        appConfig.librarys.push(library)
      }
      appConfig.defaultLibrary = library
    }
    saveAppData()
  })
}

function initWedgeApp(){
  if(!appConfig.defaultLibrary){
    createNewLibrary()
  }
  // exist a wedge instance
  if(wedgeApp){
    if(wedgeApp.dir === appConfig.defaultLibrary){
        return
    }
    wedgeApp.database.closeSync()
  }
  wedgeApp = new Wedge(appConfig.defaultLibrary)
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  initWedgeApp()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// read and init app config infomations
initAppData()