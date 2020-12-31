// const { app, BrowserWindow, ipcMain, shell } = require("electron");
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import { Scheme, ProcessType, Process, Variable } from "./models";

const dataFilePath = "data/schemes.json";

let win: BrowserWindow;
var schemes: Scheme[];
// addRandomSchemes();

function addRandomSchemes() {
	const hoyHablamosURL = new Variable({
		name: "Hoy hablamos URL",
		value: "https://www.hoyhablamos.com",
		id: uuidv4(),
	});
	const gTranslateURL = new Variable({
		name: "Google translate URL",
		value: "https://translate.google.com",
		id: uuidv4(),
	});
	const googleURL = new Variable({
		name: "Google URL",
		value: "https://www.google.com",
		id: uuidv4(),
	});
	const appleURL = new Variable({
		name: "Apple URL",
		value: "https://www.apple.com",
		id: uuidv4(),
	});
	const w3schoolsURL = new Variable({
		name: "W3Schools URL",
		value: "https://www.w3schools.com",
		id: uuidv4(),
	});
	const youtubeURL = new Variable({
		name: "Youtube URL",
		value: "https://www.youtube.com",
		id: uuidv4(),
	});
	const camUniURL = new Variable({
		name: "Cambridge University URL",
		value: "https://www.cam.ac.uk",
		id: uuidv4(),
	});

	const process1 = new Process({
		processName: "Open Google",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [googleURL],
		outputVars: [],
	});
	const process2 = new Process({
		processName: "Open apple",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [appleURL],
		outputVars: [],
	});
	const process3 = new Process({
		processName: "Open w3school",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [w3schoolsURL],
		outputVars: [],
	});
	const process4 = new Process({
		processName: "Open youtube",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [youtubeURL],
		outputVars: [],
	});
	const process5 = new Process({
		processName: "Open cam uni",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [camUniURL],
		outputVars: [],
	});
	const process6 = new Process({
		processName: "Dummy 1",
		processType: ProcessType.dummy,
		id: uuidv4(),
		inputVars: [googleURL, appleURL, w3schoolsURL],
		outputVars: [youtubeURL, camUniURL],
	});
	const openHoyhablamos = new Process({
		processName: "Open Hoy hablamos",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [hoyHablamosURL],
		outputVars: [],
	});
	const openGTranslate = new Process({
		processName: "Open G Translate",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [gTranslateURL],
		outputVars: [],
	});

	const scheme1 = new Scheme({ schemeName: "Scheme 1 bro", id: uuidv4(), processes: [process1, process2, process3] });
	const scheme3 = new Scheme({
		schemeName: "wow scheme 2",
		id: uuidv4(),
		processes: [process6, process5, process2, process3],
	});
	const spanishScheme = new Scheme({
		schemeName: "Spanish",
		id: uuidv4(),
		processes: [openHoyhablamos, openGTranslate],
	});

	for (const scheme of [scheme1, scheme3, spanishScheme]) {
		schemes.push(scheme);
	}
}

function createWindow() {
	schemes = retrieveSchemes(dataFilePath);

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

app.on("before-quit", () => {
	saveSchemes(dataFilePath);
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
	const scheme = getScheme(schemeID);
	event.reply("requestSchemeData-reply", scheme);
});

ipcMain.on("openURLInBrowser", (event, url) => {
	console.log("Trying to open " + url);
	require("electron").shell.openExternal(url);
});

ipcMain.on("runScheme", (event, schemeID) => {
	const scheme = getScheme(schemeID);
	console.log("Running scheme: " + scheme.data.schemeName);
	scheme.runScheme();
});

ipcMain.on("goToHome", (event) => {
	goToHome();
});

ipcMain.on("printAll", (event) => {
	console.log("---Schemes---");
	console.log(schemes);
	console.log("---Processes---");
	for (const scheme of schemes) {
		for (const eachProcess of scheme.data.processes) {
			console.log(eachProcess.data);
		}
	}
	console.log("---Variables---");
	for (const scheme of schemes) {
		for (const eachProcess of scheme.data.processes) {
			for (const eachInput of eachProcess.data.inputVars) {
				console.log(eachInput);
			}
			for (const eachOutput of eachProcess.data.outputVars) {
				console.log(eachOutput);
			}
		}
	}
});

ipcMain.on("updateScheme", (event, schemeData: Scheme) => {
	for (const scheme of schemes) {
		if (scheme.data.id == schemeData.data.id) {
			console.log("Updating scheme data...");
			const updatedScheme = new Scheme(schemeData.data);
			updateScheme(updatedScheme);
		}
	}
});

function goToHome() {
	win.loadFile("build/index.html");
}

function getScheme(schemeID: string) {
	for (const scheme of schemes) {
		if (scheme.data.id == schemeID) {
			return scheme;
		}
	}
	throw Error("Could not find scheme with ID: " + schemeID);
}

function updateScheme(updatedScheme: Scheme) {
	for (var i = 0; i < schemes.length; i++) {
		const oldScheme = schemes[i];
		if (oldScheme.data.id == updatedScheme.data.id) {
			schemes[i] = updatedScheme;
		}
	}
}

function saveSchemes(filepath: string) {
	console.log("Saving data...");
	let data = JSON.stringify(schemes);
	fs.writeFileSync(filepath, data);
}

function retrieveSchemes(filepath: string) {
	console.log("Retrieving data...");
	let rawdata = fs.readFileSync(filepath);
	let schemesData: Scheme[] = JSON.parse(rawdata.toString());
	let newSchemes: Scheme[] = [];
	for (const eachScheme of schemesData) {
		newSchemes.push(new Scheme(eachScheme.data));
	}
	return newSchemes;
}
