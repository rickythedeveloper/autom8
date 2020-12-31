import { ipcRenderer } from "electron";
import querystring from "querystring";
import { Scheme, Process, Variable } from "./models";
import bootstrap from "bootstrap";

var editVariableModalElem: HTMLElement;
var bootVariableModal: bootstrap.Modal;
var schemeID: string;
var scheme: Scheme;

initialise();

function initialise() {
	setGlobalVariables();
	requestDataAndSetupPage();
}

function setGlobalVariables() {
	editVariableModalElem = getEditVariableModalElem() as HTMLElement;
	bootVariableModal = getBootVariableModal() as bootstrap.Modal;
	schemeID = getSchemeId() as string;

	function getEditVariableModalElem() {
		const elem = document.getElementById("editVariableModal");
		if (!elem) {
			throw "Edit variable modal element not found";
		}
		return elem;
	}

	function getBootVariableModal() {
		const modalElem = document.getElementById("editVariableModal");
		if (!modalElem) {
			throw "Modal element not found";
		}
		return new bootstrap.Modal(modalElem);
	}

	function getSchemeId(): string {
		let query = querystring.parse(global.location.search);
		if (query == null) {
			throw "No scheme id found (no query was completed when edit scheme page opened";
		}
		if ("?schemeID" in query) {
			const schemeID: string | string[] = query["?schemeID"];
			if (typeof schemeID !== "string") {
				throw "The query found was not a string. Likely an array of strings";
			}
			return schemeID as string;
		}
		throw "No scheme id found (query does not contain scheme id";
	}
}

function requestDataAndSetupPage() {
	// based on the reply to the data request with scheme id, complete html
	ipcRenderer.on("requestSchemeData-reply", (event, schemeData: Scheme) => {
		scheme = new Scheme(schemeData.data);
		setupPage(scheme);
	});

	// request all the data with the id obtained
	ipcRenderer.send("requestSchemeData", schemeID);
}

function setupPage(scheme: Scheme) {
	setSchemeName(scheme);
	addProcessElems(scheme);
	addVariableElems(scheme);
}

function setSchemeName(scheme: Scheme) {
	const schemeNameElem = document.getElementById("schemeName");
	if (!schemeNameElem) {
		throw "Could not find the scheme name element";
	}
	schemeNameElem.innerHTML = scheme.data.schemeName;
}

function addProcessElems(scheme: Scheme) {
	const processesElem = document.getElementById("processes");
	if (!processesElem) {
		throw "processes element was not found";
	}

	const processes = scheme.data.processes;
	for (const eachProcess of processes) {
		const processElem = document.createElement("div");
		processElem.innerHTML = eachProcess.data.processName;
		processElem.style.backgroundColor = "red";
		processElem.id = eachProcess.data.id;
		processesElem.appendChild(processElem);
	}
}

function addVariableElems(scheme: Scheme) {
	for (const eachProcess of scheme.data.processes) {
		const processTypeData = eachProcess.processTypeData;

		const inputWrapper = variableWrapper(VariableIO.input, eachProcess);
		const outputWrapper = variableWrapper(VariableIO.output, eachProcess);

		const processElem = document.getElementById(eachProcess.data.id);
		if (!processElem?.parentNode) {
			throw "Either the process element is null or its parentNode is null";
		}
		processElem.parentNode.insertBefore(inputWrapper, processElem);
		insertAfter(processElem, outputWrapper);
	}
}

enum VariableIO {
	input = "input",
	output = "output",
}

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

function insertAfter(referenceNode: HTMLElement, newNode: HTMLElement) {
	if (!referenceNode?.parentNode) {
		throw "Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist";
	}
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function variableElem(variable: Variable, label: string) {
	const vName = variable.data.name;
	const vValue = variable.data.value;
	const vID = variable.data.id;
	const elem = document.createElement("div");
	elem.textContent = vName + "(" + label + ")"; //+ '\n(' + vValue + ')'
	elem.className = "variable";
	elem.setAttribute("data-variable-id", vID);
	elem.setAttribute("data-variable-name", vName);
	elem.setAttribute("data-variable-value", vValue);
	setOnClickVariableElem(elem);
	return elem;
}

function setOnClickVariableElem(elem: HTMLElement) {
	elem.onclick = function () {
		const vName = elem.getAttribute("data-variable-name");
		const vValue = elem.getAttribute("data-variable-value");
		const vID = elem.getAttribute("data-variable-id");
		if (!vName || !vValue || !vID) {
			throw (
				"One or more of [name, value, id] of the variable could not be obtained. name: " +
				vName +
				", value: " +
				vValue +
				", id: " +
				vID
			);
		}

		const vNameELem = editVariableModalElem.querySelector(".modal-body #input-variable-name") as HTMLInputElement;
		const vValueElem = editVariableModalElem.querySelector(".modal-body #input-variable-value") as HTMLInputElement;
		vNameELem.value = vName;
		vValueElem.value = vValue;
		editVariableModalElem.setAttribute("data-variable-id", vID);

		bootVariableModal.show();
	};
}

// ----- below are functions that might be run from HTML -----
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
		for (const eachInput of eachProcess.data.inputVars) {
			if (eachInput.data.id == vID) {
				eachInput.data.name = vNameElem.value;
				eachInput.data.value = vValueElem.value;
			}
		}
	}
	ipcRenderer.send("updateScheme", scheme);

	// hide the modal
	editVariableModalElem.removeAttribute("data-variable-id");
	bootVariableModal.hide();
}

function runScheme() {
	ipcRenderer.send("runScheme", schemeID);
}

function goToHome() {
	ipcRenderer.send("goToHome");
}
