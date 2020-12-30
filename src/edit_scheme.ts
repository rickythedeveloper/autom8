import { ipcRenderer } from "electron";
import querystring from "querystring";
import { Scheme, Process, Variable } from "./models";
import bootstrap from "bootstrap";

var editVariableModalElem: HTMLElement;
var bootVariableModal: bootstrap.Modal;
var schemeID: string;

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
	ipcRenderer.on("requestSchemeData-reply", (event, schemeData) => {
		setupPage(schemeData);
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
	schemeNameElem.innerHTML = scheme.schemeName;
}

function addProcessElems(scheme: Scheme) {
	const processesElem = document.getElementById("processes");
	if (!processesElem) {
		throw "processes element was not found";
	}

	const processes = scheme.processes;
	for (const eachProcess of processes) {
		const processElem = document.createElement("div");
		processElem.innerHTML = eachProcess.data.processName;
		processElem.style.backgroundColor = "red";
		processElem.id = eachProcess.data.id;
		processesElem.appendChild(processElem);
	}
}

function addVariableElems(scheme: Scheme) {
	for (const eachProcess of scheme.processes) {
		const nInputs = eachProcess.data.processType.nInputs;
		const nOutputs = eachProcess.data.processType.nOutputs;

		const inputWrapper = variableWrapper(VariableIO.input, nInputs, eachProcess);
		const outputWrapper = variableWrapper(VariableIO.output, nOutputs, eachProcess);

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

function variableWrapper(io: VariableIO, num: number, theProcess: Process): HTMLDivElement {
	// create inputs wrapper
	const wrapper = document.createElement("div");
	wrapper.className = VariableIO[io] + "-wrapper row";
	const inputWidth = num <= 0 ? 0 : num < 3 ? 12 / num : 4;

	// put each input in a col
	const IOs = io == VariableIO.input ? theProcess.data.inputVars : theProcess.data.outputVars;
	for (const variable of IOs) {
		const column = document.createElement("div");
		const colClass = "col-" + inputWidth;
		column.className = colClass;
		const varElem = variableElem(variable);
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

function variableElem(variable: Variable) {
	const vName = variable.data.name;
	const vValue = variable.data.value;
	const vID = variable.data.id;
	const elem = document.createElement("div");
	elem.textContent = vName; //+ '\n(' + vValue + ')'
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
	editVariableModalElem.removeAttribute("data-variable-id");
	bootVariableModal.hide();
	console.log("Saving variable data (to be implemented");
}

function runScheme() {
	ipcRenderer.send("runScheme", schemeID);
}

function goToHome() {
	ipcRenderer.send("goToHome");
}
