const { app, BrowserWindow, ipcMain, shell } = require('electron')

const { Scheme, Process, ProcessType } = require('./models.js')

var win
var schemes = {}
addRandomSchemes()

function addRandomSchemes() {
    process1 = new Process(processName='Open google', type=ProcessType.open_url_in_browser, url='https://www.google.com')
    process2 = new Process(processName='Open apple', type=ProcessType.open_url_in_browser, url='https://www.apple.com')
    process3 = new Process(processName='Open w3school', type=ProcessType.open_url_in_browser, url='https://www.w3schools.com')
    process4 = new Process(processName='Open youtube', type=ProcessType.open_url_in_browser, url='https://www.youtube.com')
    process5 = new Process(processName='Open cam uni', type=ProcessType.open_url_in_browser, url='https://www.cam.ac.uk')
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
    win.loadFile('index.html')
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
ipcMain.on('edit_scheme', (event, schemeID) => {
    win.loadFile('edit_scheme.html', {query: {"scheme_id": schemeID}})
})

ipcMain.on('requestSchemeData', (event, scheme_id) => {
    if (scheme_id in schemes) {
        event.reply('requestSchemeData-reply', schemes[scheme_id])    
    } else {
        console.log('We could not find the scheme requested.')
    }
})

ipcMain.on('open_url_in_browser', (event, url) => {
    console.log('Trying to open ' + url)
    require('electron').shell.openExternal(url)
})
