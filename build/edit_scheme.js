"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var querystring_1 = __importDefault(require("querystring"));
var schemeID;
initialise();
function initialise() {
    // get the scheme id based on the query string
    schemeID = getSchemeId();
    // based on the reply to the data request with scheme id, complete html
    electron_1.ipcRenderer.on("requestSchemeData-reply", function (event, schemeData) {
        setupPage(schemeData);
    });
    // request all the data with the id obtained
    electron_1.ipcRenderer.send("requestSchemeData", schemeID);
}
function getSchemeId() {
    var query = querystring_1.default.parse(global.location.search);
    if (query == null) {
        console.log("No scheme id found (no query was completed when edit scheme page opened");
    }
    if ("?schemeID" in query) {
        var schemeID_1 = query["?schemeID"];
        if (typeof schemeID_1 !== "string") {
            console.log("The query found was not a string. Likely an array of strings");
            return null;
        }
        return schemeID_1;
    }
    else {
        console.log("No scheme id found (query does not contain scheme id");
        return null;
    }
}
function setupPage(scheme) {
    setSchemeName(scheme);
    addProcessElems(scheme);
    addVariableElems(scheme);
    dealWithVariableModal();
}
function setSchemeName(scheme) {
    var schemeNameElem = document.getElementById("schemeName");
    if (schemeNameElem) {
        schemeNameElem.innerHTML = scheme.schemeName;
    }
    else {
        console.log("Could not find the scheme name element");
    }
}
function addProcessElems(scheme) {
    var processesElem = document.getElementById("processes");
    if (!processesElem) {
        return;
    }
    var processes = scheme.processes;
    for (var _i = 0, processes_1 = processes; _i < processes_1.length; _i++) {
        var eachProcess = processes_1[_i];
        var processElem = document.createElement("div");
        processElem.innerHTML = eachProcess.data.processName;
        processElem.style.backgroundColor = "red";
        processElem.id = eachProcess.data.id;
        processesElem.appendChild(processElem);
    }
}
function addVariableElems(scheme) {
    for (var _i = 0, _a = scheme.processes; _i < _a.length; _i++) {
        var eachProcess = _a[_i];
        var nInputs = eachProcess.data.processType.nInputs;
        var nOutputs = eachProcess.data.processType.nOutputs;
        var inputWrapper = variableWrapper(VariableIO.input, nInputs, eachProcess);
        var outputWrapper = variableWrapper(VariableIO.output, nOutputs, eachProcess);
        var processElem = document.getElementById(eachProcess.data.id);
        if (!(processElem === null || processElem === void 0 ? void 0 : processElem.parentNode)) {
            console.log("Either the process element is null or its parentNode is null");
            return;
        }
        processElem.parentNode.insertBefore(inputWrapper, processElem);
        insertAfter(processElem, outputWrapper);
    }
}
var VariableIO;
(function (VariableIO) {
    VariableIO["input"] = "input";
    VariableIO["output"] = "output";
})(VariableIO || (VariableIO = {}));
function variableWrapper(io, num, theProcess) {
    // create inputs wrapper
    var wrapper = document.createElement("div");
    wrapper.className = VariableIO[io] + "-wrapper row";
    var inputWidth = num <= 0 ? 0 : num < 3 ? 12 / num : 4;
    // put each input in a col
    var IOs = io == VariableIO.input ? theProcess.data.inputVars : theProcess.data.outputVars;
    for (var _i = 0, IOs_1 = IOs; _i < IOs_1.length; _i++) {
        var variable = IOs_1[_i];
        var column = document.createElement("div");
        var colClass = "col-" + inputWidth;
        column.className = colClass;
        var varElem = variableElem(variable);
        column.appendChild(varElem);
        wrapper.appendChild(column);
    }
    return wrapper;
}
function insertAfter(referenceNode, newNode) {
    if (!(referenceNode === null || referenceNode === void 0 ? void 0 : referenceNode.parentNode)) {
        console.log("Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist");
        return;
    }
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function variableElem(variable) {
    var vName = variable.data.name;
    var vValue = variable.data.value;
    var elem = document.createElement("div");
    elem.textContent = vName; //+ '\n(' + vValue + ')'
    elem.className = "variable";
    elem.setAttribute("data-variable-name", vName);
    elem.setAttribute("data-variable-value", vValue);
    elem.setAttribute("data-bs-toggle", "modal");
    elem.setAttribute("data-bs-target", "#editVariableModal");
    return elem;
}
function dealWithVariableModal() {
    var editVariableModal = document.getElementById("editVariableModal");
    if (!editVariableModal) {
        console.log("The modal element could not found");
        return;
    }
    editVariableModal.addEventListener("show.bs.modal", function (event) {
        // Cast event into MouseEvent since it is the only type that has relatedTarget property.
        var thisEvent = event;
        var elem = thisEvent.relatedTarget;
        var vName = elem.getAttribute("data-variable-name");
        var vValue = elem.getAttribute("data-variable-value");
        var vNameELem = editVariableModal.querySelector(".modal-body #input-variable-name");
        var vValueElem = editVariableModal.querySelector(".modal-body #input-variable-value");
        if (!vName || !vValue) {
            console.log("THe name and/or value of the variable could not be obtained. name: " + vName + ", value: " + vValue);
            return;
        }
        vNameELem.value = vName;
        vValueElem.value = vValue;
    });
}
function runScheme() {
    electron_1.ipcRenderer.send("runScheme", schemeID);
}
function goToHome() {
    electron_1.ipcRenderer.send("goToHome");
}
