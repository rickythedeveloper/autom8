import { ipcRenderer } from "electron";
import querystring from "querystring";
import { Scheme, Process, Variable } from "./models";
import { getElementById, getAttribute } from "./html_support";
import bootstrap from "bootstrap";
import { v4 as uuidv4 } from "uuid";

var editVariableModalElem: HTMLElement;
var bootVariableModal: bootstrap.Modal;
var bootProcessModal: bootstrap.Modal;
var editProcessModalElem: HTMLElement;
var schemeID: string;
var scheme: Scheme;

initialise();

/**
 * Initialises the scheme edit page
 * by setting some global variables we need and setting up the page based on them.
 */
function initialise() {
	setGlobalVariables();
	requestDataAndSetupPage();
}

/**
 * Set up global variables like the edit variable modal element, its reference from Bootstrap,
 * and the scheme ID for this scheme.
 */
function setGlobalVariables() {
	editVariableModalElem = getElementById("editVariableModal");
	bootVariableModal = new bootstrap.Modal(editVariableModalElem);
	editProcessModalElem = getElementById("editProcessModal");
	bootProcessModal = new bootstrap.Modal(editProcessModalElem);
	schemeID = getSchemeId() as string;

	function getSchemeId(): string {
		// Get the query for this html.
		// e.g. edit_scheme.html?schemeID=blah_blah_blah
		let query = querystring.parse(global.location.search);
		if (query == null) {
			throw Error("No scheme id found (no query was completed when edit scheme page opened");
		}

		// if the scheme ID is in the query, then we find it and return it as long as the type is string as expected.
		if ("?schemeID" in query) {
			const schemeID: string | string[] = query["?schemeID"];
			if (typeof schemeID !== "string") {
				throw Error("The query found was not a string. Likely an array of strings");
			}
			return schemeID as string;
		}
		throw Error("No scheme id found (query does not contain scheme id");
	}
}

/**
 * Sends a message to the main process and
 * based on the response which is a Scheme object, sets up the page.
 */
function requestDataAndSetupPage() {
	// based on the reply to the data request with scheme id, complete html
	ipcRenderer.on("requestSchemeData-reply", (event, schemeData: Scheme) => {
		scheme = new Scheme(schemeData.data); // Put the data as a new Scheme object so we can refer to its class functions etc.
		setupPage(scheme);
	});

	// request all the data with the id obtained
	ipcRenderer.send("requestSchemeData", schemeID);
}

/**
 * Sets up the page based on the scheme data.
 * @param scheme the scheme object based on which the page will be set up.
 */
function setupPage(scheme: Scheme) {
	setSchemeName(scheme);
	updateProcessElems(scheme);
	addVariableElems(scheme); // variables elems as inputs / outputs of the processes
	updateVariableSection(scheme); // variables section on the side
	addProcessTypesToModal();
}

/**
 * Update the scheme name element
 * @param scheme
 */
function setSchemeName(scheme: Scheme) {
	const schemeNameElem = getElementById("schemeName");
	schemeNameElem.innerHTML = scheme.data.schemeName;
}

/**
 * Updates elements representing each process of the given scheme within the #processes element
 * @param scheme
 */
function updateProcessElems(scheme: Scheme) {
	// Find the #processes element
	const processesElem = getElementById("processes");

	// Empty the element
	processesElem.innerHTML = "";

	// Add each process within that element
	const processes = scheme.data.processes;
	for (const eachProcess of processes) {
		const processElem = document.createElement("div");
		processElem.innerHTML = eachProcess.data.processName;
		processElem.style.backgroundColor = "red";
		processElem.id = eachProcess.data.id;
		setOnClickProcessElem(processElem);
		processesElem.appendChild(processElem);
	}
}

/**
 * Sets the onclick event for a process element.
 * THis shows a process edit modal which allows user to edit the process.
 * @param elem The process element
 */
function setOnClickProcessElem(elem: HTMLElement) {
	elem.onclick = function () {
		// get all info we need
		const pID = elem.id;
		const thisProcess = scheme.processWithID(pID);
		const pNameElem = getElementById("input-process-name") as HTMLInputElement;
		const pTypeElem = getElementById("select-process-type") as HTMLSelectElement;

		// put the info into the modal
		pNameElem.value = thisProcess.data.processName;
		pTypeElem.selectedIndex = thisProcess.data.processType;

		// disable choosing process type when editing a process
		pTypeElem.disabled = true;

		// Set the process id data and show the modal
		editProcessModalElem.setAttribute("data-process-id", pID);
		bootProcessModal.show();
	};
}

/**
 * Adds the input/output variable elements around each process.
 * @param scheme
 */
function addVariableElems(scheme: Scheme) {
	for (const eachProcess of scheme.data.processes) {
		const processTypeData = eachProcess.processTypeData;

		const inputWrapper = variableWrapper(VariableIO.input, eachProcess);
		const outputWrapper = variableWrapper(VariableIO.output, eachProcess);

		const processElem = getElementById(eachProcess.data.id);
		if (!processElem.parentNode) {
			throw Error("Either the process element's parentNode is null");
		}
		processElem.parentNode.insertBefore(inputWrapper, processElem);
		insertAfter(processElem, outputWrapper);
	}
}

enum VariableIO {
	input = "input",
	output = "output",
}

/**
 * Returns the input or output variable wrapper given the process
 * @param io An enum member representing whether this wrapper is for inputs or outputs
 * @param theProcess The Process object around which this wrapper will be created.
 */
function variableWrapper(io: VariableIO, theProcess: Process): HTMLDivElement {
	const variables = io == VariableIO.input ? theProcess.data.inputVars : theProcess.data.outputVars;
	const varLabels =
		io == VariableIO.input ? theProcess.processTypeData.inputLabels : theProcess.processTypeData.outputLabels;
	if (variables.length != varLabels.length) {
		throw Error("The numbers of variables and variable labels did not match.");
	}
	// create inputs wrapper
	const wrapper = document.createElement("div");
	wrapper.className = VariableIO[io] + "-wrapper row";
	const nVars = variables.length;
	const inputWidth = nVars <= 0 ? 0 : nVars < 3 ? 12 / nVars : 4;

	// put each input in a col
	for (var i = 0; i < variables.length; i++) {
		const variable = variables[i];
		const varLabel = varLabels[i];
		const column = document.createElement("div");
		const colClass = "col-" + inputWidth;
		column.className = colClass;
		const varElem = variableElem(variable, varLabel);
		column.appendChild(varElem);
		wrapper.appendChild(column);
	}
	return wrapper;
}

/**
 * Inserts the newNode after the referenceNode in the html.
 * @param referenceNode
 * @param newNode
 */
function insertAfter(referenceNode: HTMLElement, newNode: HTMLElement) {
	if (!referenceNode?.parentNode) {
		throw Error(
			"Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist"
		);
	}
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * Returns the html element for a given variable with an optional label
 * @param variable the Variable object
 * @param label The type of the variable e.g. URL, string, picture etc.
 */
function variableElem(variable: Variable, label?: string) {
	const vName = variable.data.name;
	const vValue = variable.data.value;
	const vID = variable.data.id;
	const elem = document.createElement("div");
	if (label) {
		elem.textContent = vName + "(" + label + ")";
	} else {
		elem.textContent = vName;
	}
	// Mine the necessary data in html to allow editing the variable using modal.
	elem.className = "variable";
	elem.setAttribute("data-variable-id", vID);
	elem.setAttribute("data-variable-name", vName);
	elem.setAttribute("data-variable-value", vValue);
	setOnClickVariableElem(elem);
	return elem;
}

/**
 * Sets the on click action to opening up a modal for the given variable element.
 * @param elem The variable element to add the onclick to.
 */
function setOnClickVariableElem(elem: HTMLElement) {
	elem.onclick = function () {
		// Get variable data from html
		const vName = elem.getAttribute("data-variable-name");
		const vValue = elem.getAttribute("data-variable-value");
		const vID = elem.getAttribute("data-variable-id");
		if (!vName || !vValue || !vID) {
			throw Error(
				"One or more of [name, value, id] of the variable could not be obtained. name: " +
					vName +
					", value: " +
					vValue +
					", id: " +
					vID
			);
		}

		// Put the info in the modal
		const vNameELem = editVariableModalElem.querySelector(".modal-body #input-variable-name") as HTMLInputElement;
		const vValueElem = editVariableModalElem.querySelector(".modal-body #input-variable-value") as HTMLInputElement;
		vNameELem.value = vName;
		vValueElem.value = vValue;
		editVariableModalElem.setAttribute("data-variable-id", vID);

		// Show the modal
		bootVariableModal.show();
	};
}

/**
 * Updates the variable section on the side for the given scheme.
 * @param scheme
 */
function updateVariableSection(scheme: Scheme) {
	const variablesDiv = getElementById("variables");
	variablesDiv.innerHTML = "";
	const variables = scheme.allVariables;
	for (const eachVar of variables) {
		variablesDiv.appendChild(variableElem(eachVar));
	}
}

function addProcessTypesToModal() {
	const selectElem = getElementById("select-process-type");
	let isFirst = true;
	for (const eachProcessTypeData of Process.allProcessTypes) {
		const optionElem = document.createElement("option");
		optionElem.selected = isFirst;
		optionElem.value = eachProcessTypeData.typeName;
		optionElem.innerText = eachProcessTypeData.typeLabel;
		selectElem.appendChild(optionElem);
		isFirst = false;
	}
}

// ----- below are functions that might be run from HTML -----
/**
 * Finds all the variables with the ID found in the modal,
 * and updates them based on the information found in the modal.
 */
function saveVariableChange() {
	// find the variable id
	const vID = editVariableModalElem.getAttribute("data-variable-id");
	if (!vID) {
		throw Error("variable id not found");
	}

	const vNameElem = editVariableModalElem.querySelector("#input-variable-name") as HTMLInputElement;
	const vValueElem = editVariableModalElem.querySelector("#input-variable-value") as HTMLInputElement;
	if (!vNameElem || !vValueElem) {
		throw Error("The variable name and/or value element was not found");
	}

	// find the variable object and update it
	// this will update all the variable objects with the identical ID in this scheme.
	// The variables outside this scheme will not be affected.
	for (const eachProcess of scheme.data.processes) {
		for (const varArray of [eachProcess.data.inputVars, eachProcess.data.outputVars]) {
			for (const eachVar of varArray) {
				if (eachVar.data.id == vID) {
					eachVar.data.name = vNameElem.value;
					eachVar.data.value = vValueElem.value;
				}
			}
		}
	}
	ipcRenderer.send("updateScheme", scheme);

	// hide the modal
	editVariableModalElem.removeAttribute("data-variable-id");
	bootVariableModal.hide();
}

/**
 * Sends a request to the main process to run this scheme
 */
function runScheme() {
	ipcRenderer.send("runScheme", schemeID);
}

/**
 * Sends a request to the main process to go back to the home pgae.
 */
function goToHome() {
	ipcRenderer.send("goToHome");
}

/**
 * Opens the Process modal view so the user can enter the details for a new process.
 */
function addProcess() {
	// Put the info in the modal
	const pNameELem = getElementById("input-process-name") as HTMLInputElement;
	const pTypeElem = getElementById("select-process-type") as HTMLSelectElement;
	pNameELem.value = "";
	pTypeElem.selectedIndex = 0; // default should be the first option
	pTypeElem.disabled = false; // enable choosing process type

	editProcessModalElem.setAttribute("data-is-new", "true");

	// Show the modal
	bootProcessModal.show();
}

/**
 * Saves the change in Process data (name and type).
 */
function saveProcessChange() {
	const newName = (getElementById("input-process-name") as HTMLInputElement).value;
	const newType = (getElementById("select-process-type") as HTMLInputElement).value;
	const processTypeNum = Process.processTypeNum(newType);

	if (editProcessModalElem.getAttribute("data-is-new") == "true") {
		// make inputVars and outputVars arrays with 'empty' Variable objects
		let inputVars: Variable[] = [];
		const nInputs = Process.allProcessTypes[processTypeNum].inputLabels.length;
		let outputVars: Variable[] = [];
		const nOutputs = Process.allProcessTypes[processTypeNum].outputLabels.length;
		for (var i = 0; i < nInputs; i++) {
			inputVars.push(Variable.emptyVariable());
		}
		for (var i = 0; i < nOutputs; i++) {
			outputVars.push(Variable.emptyVariable());
		}

		// Make a new Process object
		let thisProcess = new Process({
			processName: newName,
			processType: processTypeNum,
			id: uuidv4(),
			inputVars: inputVars,
			outputVars: outputVars,
		});

		// Add to the scheme
		scheme.data.processes.push(thisProcess);
	} else {
		// Find the process
		const processID = getAttribute(editProcessModalElem, "data-process-id");
		editProcessModalElem.removeAttribute("data-process-id");
		const editedProcess = scheme.processWithID(processID);

		// update the process
		editedProcess.data.processName = newName;
		editedProcess.data.processType = processTypeNum;
	}

	// update the scheme data in the main process
	ipcRenderer.send("updateScheme", scheme);

	// Set the data-is-new flag to false for next use, and hide the modal
	editProcessModalElem.setAttribute("data-is-new", "false");
	bootProcessModal.hide();
}
