import { ipcRenderer } from "electron";
import querystring from "querystring";
import { Scheme, Process, Variable } from "./models";

var schemeID: string;
initialise();

function initialise() {
	// get the scheme id based on the query string
	schemeID = getSchemeId() as string;

	// based on the reply to the data request with scheme id, complete html
	ipcRenderer.on("requestSchemeData-reply", (event, schemeData) => {
		setupPage(schemeData);
	});

	// request all the data with the id obtained
	ipcRenderer.send("requestSchemeData", schemeID);
}

function getSchemeId(): string | null {
	let query = querystring.parse(global.location.search);
	if (query == null) {
		console.log("No scheme id found (no query was completed when edit scheme page opened");
	}
	if ("?schemeID" in query) {
		const schemeID: string | string[] = query["?schemeID"];
		if (typeof schemeID !== "string") {
			console.log("The query found was not a string. Likely an array of strings");
			return null;
		}
		return schemeID as string;
	} else {
		console.log("No scheme id found (query does not contain scheme id");
		return null;
	}
}

function setupPage(scheme: Scheme) {
	setSchemeName(scheme);
	addProcessElems(scheme);
	addVariableElems(scheme);
	dealWithVariableModal();
}

function setSchemeName(scheme: Scheme) {
	const schemeNameElem = document.getElementById("schemeName");
	if (schemeNameElem) {
		schemeNameElem.innerHTML = scheme.schemeName;
	} else {
		console.log("Could not find the scheme name element");
	}
}

function addProcessElems(scheme: Scheme) {
	const processesElem = document.getElementById("processes");
	if (!processesElem) {
		return;
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
			console.log("Either the process element is null or its parentNode is null");
			return;
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
		console.log(
			"Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist"
		);
		return;
	}
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function variableElem(variable: Variable) {
	const vName = variable.data.name;
	const vValue = variable.data.value;
	const elem = document.createElement("div");
	elem.textContent = vName; //+ '\n(' + vValue + ')'
	elem.className = "variable";
	elem.setAttribute("data-variable-name", vName);
	elem.setAttribute("data-variable-value", vValue);
	elem.setAttribute("data-bs-toggle", "modal");
	elem.setAttribute("data-bs-target", "#editVariableModal");
	return elem;
}

function dealWithVariableModal() {
	const editVariableModal = document.getElementById("editVariableModal");
	if (!editVariableModal) {
		console.log("The modal element could not found");
		return;
	}
	editVariableModal.addEventListener("show.bs.modal", function (event) {
        // Cast event into MouseEvent since it is the only type that has relatedTarget property.
        const thisEvent = event as MouseEvent
        const elem = thisEvent.relatedTarget as HTMLElement;
		const vName = elem.getAttribute("data-variable-name");
		const vValue = elem.getAttribute("data-variable-value");
		const vNameELem = editVariableModal.querySelector(".modal-body #input-variable-name") as HTMLInputElement;
		const vValueElem = editVariableModal.querySelector(".modal-body #input-variable-value") as HTMLInputElement;
		if (!vName || !vValue) {
			console.log("THe name and/or value of the variable could not be obtained. name: " + vName + ", value: " + vValue);
			return;
		}
		vNameELem.value = vName;
		vValueElem.value = vValue;
	});
}

function runScheme() {
	ipcRenderer.send("runScheme", schemeID);
}

function goToHome() {
	ipcRenderer.send("goToHome");
}