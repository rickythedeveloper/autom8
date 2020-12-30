"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var querystring_1 = __importDefault(require("querystring"));
var bootstrap_1 = __importDefault(require("bootstrap"));
var editVariableModalElem;
var bootVariableModal;
var schemeID;
initialise();
function initialise() {
    setGlobalVariables();
    requestDataAndSetupPage();
}
function setGlobalVariables() {
    editVariableModalElem = getEditVariableModalElem();
    bootVariableModal = getBootVariableModal();
    schemeID = getSchemeId();
    function getEditVariableModalElem() {
        var elem = document.getElementById("editVariableModal");
        if (!elem) {
            throw "Edit variable modal element not found";
        }
        return elem;
    }
    function getBootVariableModal() {
        var modalElem = document.getElementById("editVariableModal");
        if (!modalElem) {
            throw "Modal element not found";
        }
        return new bootstrap_1.default.Modal(modalElem);
    }
    function getSchemeId() {
        var query = querystring_1.default.parse(global.location.search);
        if (query == null) {
            throw "No scheme id found (no query was completed when edit scheme page opened";
        }
        if ("?schemeID" in query) {
            var schemeID_1 = query["?schemeID"];
            if (typeof schemeID_1 !== "string") {
                throw "The query found was not a string. Likely an array of strings";
            }
            return schemeID_1;
        }
        throw "No scheme id found (query does not contain scheme id";
    }
}
function requestDataAndSetupPage() {
    // based on the reply to the data request with scheme id, complete html
    electron_1.ipcRenderer.on("requestSchemeData-reply", function (event, schemeData) {
        setupPage(schemeData);
    });
    // request all the data with the id obtained
    electron_1.ipcRenderer.send("requestSchemeData", schemeID);
}
function setupPage(scheme) {
    setSchemeName(scheme);
    addProcessElems(scheme);
    addVariableElems(scheme);
}
function setSchemeName(scheme) {
    var schemeNameElem = document.getElementById("schemeName");
    if (!schemeNameElem) {
        throw "Could not find the scheme name element";
    }
    schemeNameElem.innerHTML = scheme.schemeName;
}
function addProcessElems(scheme) {
    var processesElem = document.getElementById("processes");
    if (!processesElem) {
        throw "processes element was not found";
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
            throw "Either the process element is null or its parentNode is null";
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
        throw "Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist";
    }
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function variableElem(variable) {
    var vName = variable.data.name;
    var vValue = variable.data.value;
    var vID = variable.data.id;
    var elem = document.createElement("div");
    elem.textContent = vName; //+ '\n(' + vValue + ')'
    elem.className = "variable";
    elem.setAttribute("data-variable-id", vID);
    elem.setAttribute("data-variable-name", vName);
    elem.setAttribute("data-variable-value", vValue);
    setOnClickVariableElem(elem);
    return elem;
}
function setOnClickVariableElem(elem) {
    elem.onclick = function () {
        var vName = elem.getAttribute("data-variable-name");
        var vValue = elem.getAttribute("data-variable-value");
        var vID = elem.getAttribute("data-variable-id");
        if (!vName || !vValue || !vID) {
            throw ("One or more of [name, value, id] of the variable could not be obtained. name: " +
                vName +
                ", value: " +
                vValue +
                ", id: " +
                vID);
        }
        var vNameELem = editVariableModalElem.querySelector(".modal-body #input-variable-name");
        var vValueElem = editVariableModalElem.querySelector(".modal-body #input-variable-value");
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
    electron_1.ipcRenderer.send("runScheme", schemeID);
}
function goToHome() {
    electron_1.ipcRenderer.send("goToHome");
}
