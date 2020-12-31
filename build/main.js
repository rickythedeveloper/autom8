"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const { app, BrowserWindow, ipcMain, shell } = require("electron");
var electron_1 = require("electron");
var uuid_1 = require("uuid");
var models_1 = require("./models");
var win;
var schemes = {};
addRandomSchemes();
function addRandomSchemes() {
    var hoyHablamosURL = new models_1.Variable({
        name: "Hoy hablamos URL",
        value: "https://www.hoyhablamos.com",
        id: uuid_1.v4(),
    });
    var gTranslateURL = new models_1.Variable({
        name: "Google translate URL",
        value: "https://translate.google.com",
        id: uuid_1.v4(),
    });
    var googleURL = new models_1.Variable({
        name: "Google URL",
        value: "https://www.google.com",
        id: uuid_1.v4(),
    });
    var appleURL = new models_1.Variable({
        name: "Apple URL",
        value: "https://www.apple.com",
        id: uuid_1.v4(),
    });
    var w3schoolsURL = new models_1.Variable({
        name: "W3Schools URL",
        value: "https://www.w3schools.com",
        id: uuid_1.v4(),
    });
    var youtubeURL = new models_1.Variable({
        name: "Youtube URL",
        value: "https://www.youtube.com",
        id: uuid_1.v4(),
    });
    var camUniURL = new models_1.Variable({
        name: "Cambridge University URL",
        value: "https://www.cam.ac.uk",
        id: uuid_1.v4(),
    });
    var process1 = new models_1.Process({
        processName: "Open Google",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [googleURL],
        outputVars: [],
    });
    var process2 = new models_1.Process({
        processName: "Open apple",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [appleURL],
        outputVars: [],
    });
    var process3 = new models_1.Process({
        processName: "Open w3school",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [w3schoolsURL],
        outputVars: [],
    });
    var process4 = new models_1.Process({
        processName: "Open youtube",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [youtubeURL],
        outputVars: [],
    });
    var process5 = new models_1.Process({
        processName: "Open cam uni",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [camUniURL],
        outputVars: [],
    });
    var process6 = new models_1.Process({
        processName: "Dummy 1",
        processType: models_1.ProcessType.dummy,
        id: uuid_1.v4(),
        inputVars: [googleURL, appleURL, w3schoolsURL],
        outputVars: [youtubeURL, camUniURL],
    });
    var openHoyhablamos = new models_1.Process({
        processName: "Open Hoy hablamos",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [hoyHablamosURL],
        outputVars: [],
    });
    var openGTranslate = new models_1.Process({
        processName: "Open G Translate",
        processType: models_1.ProcessType.openURLInBrowser,
        id: uuid_1.v4(),
        inputVars: [gTranslateURL],
        outputVars: [],
    });
    var scheme1 = new models_1.Scheme({ schemeName: "Scheme 1 bro", id: uuid_1.v4(), processes: [process1, process2, process3] });
    var scheme3 = new models_1.Scheme({
        schemeName: "wow scheme 2",
        id: uuid_1.v4(),
        processes: [process6, process5, process2, process3],
    });
    var spanishScheme = new models_1.Scheme({
        schemeName: "Spanish",
        id: uuid_1.v4(),
        processes: [openHoyhablamos, openGTranslate],
    });
    for (var _i = 0, _a = [scheme1, scheme3, spanishScheme]; _i < _a.length; _i++) {
        var scheme = _a[_i];
        schemes[scheme.data.id] = scheme;
    }
}
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1400,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    goToHome();
    // This is called when user clicks on <a> link with target="_blank" attribute
    win.webContents.on("new-window", function (event, url) {
        event.preventDefault();
        electron_1.shell.openExternal(url);
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on("window-all-closed", function () {
    // if (process.platform !== 'darwin') {
    //     app.quit()
    // }
    electron_1.app.quit();
});
electron_1.app.on("activate", function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.ipcMain.on("requestSchemes", function (event) {
    console.log("requested schemes");
    event.reply("requestSchemes-reply", schemes);
});
// If the user wants to edit a specific scheme, we move to the scheme edit page
electron_1.ipcMain.on("editScheme", function (event, schemeID) {
    win.loadFile("build/edit_scheme.html", { query: { schemeID: schemeID } });
});
electron_1.ipcMain.on("requestSchemeData", function (event, schemeID) {
    if (schemeID in schemes) {
        event.reply("requestSchemeData-reply", schemes[schemeID]);
    }
    else {
        console.log("We could not find the scheme requested.");
    }
});
electron_1.ipcMain.on("openURLInBrowser", function (event, url) {
    console.log("Trying to open " + url);
    require("electron").shell.openExternal(url);
});
electron_1.ipcMain.on("runScheme", function (event, schemeID) {
    var scheme = schemes[schemeID];
    console.log("Running scheme: " + scheme.data.schemeName);
    scheme.runScheme();
});
electron_1.ipcMain.on("goToHome", function (event) {
    goToHome();
});
electron_1.ipcMain.on("printAll", function (event) {
    console.log("---Schemes---");
    console.log(schemes);
    console.log("---Processes---");
    for (var schemeID in schemes) {
        for (var _i = 0, _a = schemes[schemeID].data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            console.log(eachProcess.data);
        }
    }
    console.log("---Variables---");
    for (var schemeID in schemes) {
        for (var _b = 0, _c = schemes[schemeID].data.processes; _b < _c.length; _b++) {
            var eachProcess = _c[_b];
            for (var _d = 0, _e = eachProcess.data.inputVars; _d < _e.length; _d++) {
                var eachInput = _e[_d];
                console.log(eachInput);
            }
            for (var _f = 0, _g = eachProcess.data.outputVars; _f < _g.length; _f++) {
                var eachOutput = _g[_f];
                console.log(eachOutput);
            }
        }
    }
});
electron_1.ipcMain.on("updateScheme", function (event, schemeData) {
    for (var schemeID in schemes) {
        if (schemeID == schemeData.data.id) {
            console.log("Updating scheme data...");
            schemes[schemeID] = new models_1.Scheme(schemeData.data);
        }
    }
});
function goToHome() {
    win.loadFile("build/index.html");
}
