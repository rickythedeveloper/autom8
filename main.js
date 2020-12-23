const { app, BrowserWindow, ipcMain, shell } = require('electron')

const { Scheme, Process, ProcessType } = require('./models.js')

var win
var schemes = {}

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

// If the user wants to edit a specific scheme, we move to the scheme edit page
ipcMain.on('edit_scheme', (event, scheme_name) => {
    process1 = new Process(processName='Open google', type=ProcessType.open_url_in_browser, url='https://www.google.com')
    process2 = new Process(processName='Open apple', type=ProcessType.open_url_in_browser, url='https://www.apple.com')
    process3 = new Process(processName='Open w3school', type=ProcessType.open_url_in_browser, url='https://www.w3schools.com')
    scheme1 = new Scheme(schemeName='Yay scheme name bro', id=null, processes=[process1, process2, process3,])
    schemes[scheme1.id] = scheme1

    win.loadFile('edit_scheme.html', {query: {"scheme_id": scheme1.id}})
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
