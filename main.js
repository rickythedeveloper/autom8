const { app, BrowserWindow, ipcMain, shell } = require('electron')

const { Scheme, Process, ProcessType } = require('./models.js')

var win
var schemes = {}
addRandomSchemes()

function addRandomSchemes() {
    process1 = new Process({'processName': 'Open Google', 'processType': ProcessType.openURLInBrowser, 'url': 'https://www.google.com'})
    process2 = new Process({'processName': 'Open apple', 'processType': ProcessType.openURLInBrowser, 'url': 'https://www.apple.com'})
    process3 = new Process({'processName': 'Open w3school', 'processType': ProcessType.openURLInBrowser, 'url': 'https://www.w3schools.com'})
    process4 = new Process({'processName': 'Open youtube', 'processType': ProcessType.openURLInBrowser, 'url': 'https://www.youtube.com'})
    process5 = new Process({'processName': 'Open cam uni', 'processType': ProcessType.openURLInBrowser, 'url': 'https://www.cam.ac.uk'})
    scheme1 = new Scheme(schemeName='Scheme 1 bro', id=null, processes=[process1, process2, process3,])
    scheme2 = new Scheme(schemeName='Yeah man scheme 2', id=null, processes=[process2, process3, process4,])
    scheme3 = new Scheme(schemeName='wow scheme 3', id=null, processes=[process5, process2, process3,])
    for (scheme of [scheme1, scheme2, scheme3]) {
        schemes[scheme.id] = scheme
    }
}

function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true
        }
    })
    
    goToHome()
    // win.loadFile('edit_scheme.html')

    // This is called when user clicks on <a> link with target="_blank" attribute
    win.webContents.on("new-window", function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    //     app.quit()
    // }
    app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on('requestSchemes', (event) => {
    console.log('requested schemes')
    event.reply('requestSchemes-reply', schemes)
})

// If the user wants to edit a specific scheme, we move to the scheme edit page
ipcMain.on('editScheme', (event, schemeID) => {
    win.loadFile('edit_scheme.html', {query: {"schemeID": schemeID}})
})

ipcMain.on('requestSchemeData', (event, schemeID) => {
    if (schemeID in schemes) {
        event.reply('requestSchemeData-reply', schemes[schemeID])
    } else {
        console.log('We could not find the scheme requested.')
    }
})

ipcMain.on('openURLInBrowser', (event, url) => {
    console.log('Trying to open ' + url)
    require('electron').shell.openExternal(url)
})

ipcMain.on('runScheme', (event, schemeID) => {
    scheme = schemes[schemeID]
    scheme.runScheme()
})

ipcMain.on('goToHome', (event) => {
    goToHome()
})

function goToHome() {
    win.loadFile('index.html')
}