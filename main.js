const { app, BrowserWindow, ipcMain, shell } = require('electron')

var win
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
    console.log('We are going to edit ' + scheme_name + 'now') // prints "ping"

    data = {
        'scheme_name': scheme_name,
        'processes': [
            {
                'name': 'Open Google',
                'type': 'open_url_in_browser',
                'url': 'https://www.google.com',
            },
            {
                'name': 'Open Apple',
                'type': 'open_url_in_browser',
                'url': 'https://www.apple.com',
            },
            {
                'name': 'Open w3 school',
                'type': 'open_url_in_browser',
                'url': 'https://www.w3schools.com',
            },
        ]
    }

    win.loadFile('edit_scheme.html', {query: {"data": JSON.stringify(data)}})
})

ipcMain.on('open_url_in_browser', (event, url) => {
    console.log('Trying to open ' + url)
    require('electron').shell.openExternal(url)
})
