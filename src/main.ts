// const { app, BrowserWindow, ipcMain, shell } = require("electron");
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { v4 as uuidv4 } from "uuid";

import { Scheme, ProcessTypes, Process, Variable } from "./models";

let win: BrowserWindow;
let schemes: { [id: string]: Scheme } = {};
addRandomSchemes();

function addRandomSchemes() {
    const googleURL = new Variable({
        name: "Google URL",
        value: "https://www.google.com",
    });
    const appleURL = new Variable({
        name: "Apple URL",
        value: "https://www.apple.com",
    });
    const w3schoolsURL = new Variable({
        name: "W3Schools URL",
        value: "https://www.w3schools.com",
    });
    const youtubeURL = new Variable({
        name: "Youtube URL",
        value: "https://www.youtube.com",
    });
    const camUniURL = new Variable({
        name: "Cambridge University URL",
        value: "https://www.cam.ac.uk",
    });

    const process1 = new Process({
        processName: "Open Google",
        processType: ProcessTypes.openURLInBrowser,
        id: uuidv4(),
        inputVars: [googleURL],
        outputVars: [],
    });
    const process2 = new Process({
        processName: "Open apple",
        processType: ProcessTypes.openURLInBrowser,
        id: uuidv4(),
        inputVars: [appleURL],
        outputVars: [],
    });
    const process3 = new Process({
        processName: "Open w3school",
        processType: ProcessTypes.openURLInBrowser,
        id: uuidv4(),
        inputVars: [w3schoolsURL],
        outputVars: [],
    });
    const process4 = new Process({
        processName: "Open youtube",
        processType: ProcessTypes.openURLInBrowser,
        id: uuidv4(),
        inputVars: [youtubeURL],
        outputVars: [],
    });
    const process5 = new Process({
        processName: "Open cam uni",
        processType: ProcessTypes.openURLInBrowser,
        id: uuidv4(),
        inputVars: [camUniURL],
        outputVars: [],
    });
    const process6 = new Process({
        processName: "Dummy 1",
        processType: ProcessTypes.dummy,
        id: uuidv4(),
        inputVars: [googleURL, appleURL, w3schoolsURL],
        outputVars: [youtubeURL, camUniURL],
    });

    new Scheme("heylo", "ay", []);
    const scheme1 = new Scheme("Scheme 1 bro", uuidv4(), [
        process1,
        process2,
        process3,
    ]);
    const scheme2 = new Scheme("Yeah man scheme 2", uuidv4(), [
        process2,
        process3,
        process4,
        process5,
    ]);
    const scheme3 = new Scheme("wow scheme 3", uuidv4(), [
        process6,
        process5,
        process2,
        process3,
    ]);

    for (const scheme of [scheme1, scheme2, scheme3]) {
        schemes[scheme.id] = scheme;
    }
}

function createWindow() {
    win = new BrowserWindow({
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
        shell.openExternal(url);
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    // if (process.platform !== 'darwin') {
    //     app.quit()
    // }
    app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on("requestSchemes", (event) => {
    console.log("requested schemes");
    event.reply("requestSchemes-reply", schemes);
});

// If the user wants to edit a specific scheme, we move to the scheme edit page
ipcMain.on("editScheme", (event, schemeID) => {
    win.loadFile("build/edit_scheme.html", { query: { schemeID: schemeID } });
});

ipcMain.on("requestSchemeData", (event, schemeID) => {
    if (schemeID in schemes) {
        event.reply("requestSchemeData-reply", schemes[schemeID]);
    } else {
        console.log("We could not find the scheme requested.");
    }
});

ipcMain.on("openURLInBrowser", (event, url) => {
    console.log("Trying to open " + url);
    require("electron").shell.openExternal(url);
});

ipcMain.on("runScheme", (event, schemeID) => {
    const scheme = schemes[schemeID];
    scheme.runScheme();
});

ipcMain.on("goToHome", (event) => {
    goToHome();
});

function goToHome() {
    win.loadFile("build/index.html");
}
