"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { app, BrowserWindow, ipcMain, shell } = require("electron");
var electron_1 = require("electron");
var uuid_1 = require("uuid");
var fs_1 = __importDefault(require("fs"));
var models_1 = require("./models");
var dataFilePath = "data/schemes.json";
var win;
var schemes;
// addRandomSchemes();
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
        schemes.push(scheme);
    }
}
function createWindow() {
    schemes = retrieveSchemes(dataFilePath);
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
electron_1.app.on("before-quit", function () {
    saveSchemes(dataFilePath);
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
    var scheme = getScheme(schemeID);
    event.reply("requestSchemeData-reply", scheme);
});
electron_1.ipcMain.on("openURLInBrowser", function (event, url) {
    console.log("Trying to open " + url);
    require("electron").shell.openExternal(url);
});
electron_1.ipcMain.on("runScheme", function (event, schemeID) {
    var scheme = getScheme(schemeID);
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
    for (var _i = 0, schemes_1 = schemes; _i < schemes_1.length; _i++) {
        var scheme = schemes_1[_i];
        for (var _a = 0, _b = scheme.data.processes; _a < _b.length; _a++) {
            var eachProcess = _b[_a];
            console.log(eachProcess.data);
        }
    }
    console.log("---Variables---");
    for (var _c = 0, schemes_2 = schemes; _c < schemes_2.length; _c++) {
        var scheme = schemes_2[_c];
        for (var _d = 0, _e = scheme.data.processes; _d < _e.length; _d++) {
            var eachProcess = _e[_d];
            for (var _f = 0, _g = eachProcess.data.inputVars; _f < _g.length; _f++) {
                var eachInput = _g[_f];
                console.log(eachInput);
            }
            for (var _h = 0, _j = eachProcess.data.outputVars; _h < _j.length; _h++) {
                var eachOutput = _j[_h];
                console.log(eachOutput);
            }
        }
    }
});
electron_1.ipcMain.on("updateScheme", function (event, schemeData) {
    for (var _i = 0, schemes_3 = schemes; _i < schemes_3.length; _i++) {
        var scheme = schemes_3[_i];
        if (scheme.data.id == schemeData.data.id) {
            console.log("Updating scheme data...");
            var updatedScheme = new models_1.Scheme(schemeData.data);
            updateScheme(updatedScheme);
        }
    }
});
function goToHome() {
    win.loadFile("build/index.html");
}
function getScheme(schemeID) {
    for (var _i = 0, schemes_4 = schemes; _i < schemes_4.length; _i++) {
        var scheme = schemes_4[_i];
        if (scheme.data.id == schemeID) {
            return scheme;
        }
    }
    throw Error("Could not find scheme with ID: " + schemeID);
}
function updateScheme(updatedScheme) {
    for (var i = 0; i < schemes.length; i++) {
        var oldScheme = schemes[i];
        if (oldScheme.data.id == updatedScheme.data.id) {
            schemes[i] = updatedScheme;
        }
    }
}
function saveSchemes(filepath) {
    console.log("Saving data...");
    var data = JSON.stringify(schemes);
    fs_1.default.writeFileSync(filepath, data);
}
function retrieveSchemes(filepath) {
    console.log("Retrieving data...");
    var rawdata = fs_1.default.readFileSync(filepath);
    var schemesData = JSON.parse(rawdata.toString());
    var newSchemes = [];
    for (var _i = 0, schemesData_1 = schemesData; _i < schemesData_1.length; _i++) {
        var eachScheme = schemesData_1[_i];
        newSchemes.push(new models_1.Scheme(eachScheme.data));
    }
    return newSchemes;
}
