// const { app, BrowserWindow, ipcMain, shell } = require("electron");
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import { Scheme, ProcessType, Process, Variable } from "./models";

const SCHEMES_FILE_NAME = "schemes.json";
const USER_DATA_FOLDER_PATH = app.getPath("userData") + "/User Data";

let win: BrowserWindow;
var schemes: Scheme[];

/**
 * Returns the array of Schemes designed for new users
 */
function defualtSchemes(): Scheme[] {
	const googleURL = new Variable({
		name: "Google URL",
		value: "https://www.google.com",
		id: uuidv4(),
	});
	const process1 = new Process({
		processName: "Open Google",
		processType: ProcessType.openURLInBrowser,
		id: uuidv4(),
		inputVars: [googleURL],
		outputVars: [],
	});

	const scheme1 = new Scheme({ schemeName: "First scheme", id: uuidv4(), processes: [process1] });
	return [scheme1];
}

/**
 * Creates a window based on the information we find from user data (or default schemes data).
 * It gets called usually when the app opens up.
 */
function createWindow() {
	try {
		schemes = retrieveSchemes();
	} catch {
		schemes = defualtSchemes();
	}

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
	saveSchemes();
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

// ipcMain.on("openURLInBrowser", (event, url) => {
// 	console.log("Trying to open " + url);
// 	require("electron").shell.openExternal(url);
// });

ipcMain.on("runScheme", (event, schemeID) => {
	const scheme = getScheme(schemeID);
	console.log("Running scheme: " + scheme.data.schemeName);
	scheme.runScheme();
});

ipcMain.on("goToHome", (event) => {
	goToHome();
});

// Prints all the information we hold for inspection purposes.
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

// Updates our schemes data based on the given Scheme object
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

/**
 * Returns a Scheme object with the given schemeID
 * @param schemeID
 */
function getScheme(schemeID: string) {
	for (const scheme of schemes) {
		if (scheme.data.id == schemeID) {
			return scheme;
		}
	}
	throw Error("Could not find scheme with ID: " + schemeID);
}

/**
 * Updates a Scheme object with the same ID as the given updatedScheme.
 * @param updatedScheme
 */
function updateScheme(updatedScheme: Scheme) {
	for (var i = 0; i < schemes.length; i++) {
		const oldScheme = schemes[i];
		if (oldScheme.data.id == updatedScheme.data.id) {
			schemes[i] = updatedScheme;
		}
	}
}

/**
 * Makes sure we have the required directory to save schemes data in,
 * and writes to the schemes data file in the json format.
 */
function saveSchemes() {
	console.log("Saving data...");
	let data = JSON.stringify(schemes);

	// Make sure the desirable user data folder exists
	fs.mkdirSync(USER_DATA_FOLDER_PATH, { recursive: true });

	// Write the data into the filename
	const filepath = USER_DATA_FOLDER_PATH + "/" + SCHEMES_FILE_NAME;
	fs.writeFileSync(filepath, data);
}

/**
 * Returns an array of Scheme objects by reading the schemes data in the json format.
 */
function retrieveSchemes() {
	const filepath = USER_DATA_FOLDER_PATH + "/" + SCHEMES_FILE_NAME;

	console.log("Retrieving data...");
	try {
		var rawdata = fs.readFileSync(filepath);
	} catch {
		throw Error("Schemes data could not be retrieved");
	}

	let schemesData: Scheme[] = JSON.parse(rawdata.toString());
	let newSchemes: Scheme[] = [];
	for (const eachScheme of schemesData) {
		newSchemes.push(new Scheme(eachScheme.data));
	}
	return newSchemes;
}
