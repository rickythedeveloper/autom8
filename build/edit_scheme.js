"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var querystring_1 = __importDefault(require("querystring"));
var models_1 = require("./models");
var bootstrap_1 = __importDefault(require("bootstrap"));
var editVariableModalElem;
var bootVariableModal;
var schemeID;
var scheme;
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
            throw Error("Edit variable modal element not found");
        }
        return elem;
    }
    function getBootVariableModal() {
        var modalElem = document.getElementById("editVariableModal");
        if (!modalElem) {
            throw Error("Modal element not found");
        }
        return new bootstrap_1.default.Modal(modalElem);
    }
    function getSchemeId() {
        var query = querystring_1.default.parse(global.location.search);
        if (query == null) {
            throw Error("No scheme id found (no query was completed when edit scheme page opened");
        }
        if ("?schemeID" in query) {
            var schemeID_1 = query["?schemeID"];
            if (typeof schemeID_1 !== "string") {
                throw Error("The query found was not a string. Likely an array of strings");
            }
            return schemeID_1;
        }
        throw Error("No scheme id found (query does not contain scheme id");
    }
}
function requestDataAndSetupPage() {
    // based on the reply to the data request with scheme id, complete html
    electron_1.ipcRenderer.on("requestSchemeData-reply", function (event, schemeData) {
        scheme = new models_1.Scheme(schemeData.data);
        setupPage(scheme);
    });
    // request all the data with the id obtained
    electron_1.ipcRenderer.send("requestSchemeData", schemeID);
}
function setupPage(scheme) {
    setSchemeName(scheme);
    addProcessElems(scheme);
    addVariableElems(scheme); // variables elems as inputs / outputs of the processes
    updateVariableSection(scheme); // variables section on the side
}
function setSchemeName(scheme) {
    var schemeNameElem = document.getElementById("schemeName");
    if (!schemeNameElem) {
        throw Error("Could not find the scheme name element");
    }
    schemeNameElem.innerHTML = scheme.data.schemeName;
}
function addProcessElems(scheme) {
    var processesElem = document.getElementById("processes");
    if (!processesElem) {
        throw Error("processes element was not found");
    }
    var processes = scheme.data.processes;
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
    for (var _i = 0, _a = scheme.data.processes; _i < _a.length; _i++) {
        var eachProcess = _a[_i];
        var processTypeData = eachProcess.processTypeData;
        var inputWrapper = variableWrapper(VariableIO.input, eachProcess);
        var outputWrapper = variableWrapper(VariableIO.output, eachProcess);
        var processElem = document.getElementById(eachProcess.data.id);
        if (!(processElem === null || processElem === void 0 ? void 0 : processElem.parentNode)) {
            throw Error("Either the process element is null or its parentNode is null");
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
function variableWrapper(io, theProcess) {
    var variables = io == VariableIO.input ? theProcess.data.inputVars : theProcess.data.outputVars;
    var varLabels = io == VariableIO.input ? theProcess.processTypeData.inputLabels : theProcess.processTypeData.outputLabels;
    if (variables.length != varLabels.length) {
        throw Error("The numbers of variables and variable labels did not match.");
    }
    // create inputs wrapper
    var wrapper = document.createElement("div");
    wrapper.className = VariableIO[io] + "-wrapper row";
    var nVars = variables.length;
    var inputWidth = nVars <= 0 ? 0 : nVars < 3 ? 12 / nVars : 4;
    // put each input in a col
    for (var i = 0; i < variables.length; i++) {
        var variable = variables[i];
        var varLabel = varLabels[i];
        var column = document.createElement("div");
        var colClass = "col-" + inputWidth;
        column.className = colClass;
        var varElem = variableElem(variable, varLabel);
        column.appendChild(varElem);
        wrapper.appendChild(column);
    }
    return wrapper;
}
function insertAfter(referenceNode, newNode) {
    if (!(referenceNode === null || referenceNode === void 0 ? void 0 : referenceNode.parentNode)) {
        throw Error("Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist");
    }
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function variableElem(variable, label) {
    var vName = variable.data.name;
    var vValue = variable.data.value;
    var vID = variable.data.id;
    var elem = document.createElement("div");
    if (label) {
        elem.textContent = vName + "(" + label + ")";
    }
    else {
        elem.textContent = vName;
    }
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
            throw Error("One or more of [name, value, id] of the variable could not be obtained. name: " +
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
function updateVariableSection(scheme) {
    var variablesDiv = document.getElementById("variables");
    if (!variablesDiv) {
        throw Error("Variables div could not be found");
    }
    variablesDiv.innerHTML = "";
    var variables = scheme.allVariables;
    for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
        var eachVar = variables_1[_i];
        variablesDiv.appendChild(variableElem(eachVar));
    }
}
// ----- below are functions that might be run from HTML -----
function saveVariableChange() {
    // find the variable id
    var vID = editVariableModalElem.getAttribute("data-variable-id");
    if (!vID) {
        throw Error("variable id not found");
    }
    var vNameElem = editVariableModalElem.querySelector("#input-variable-name");
    var vValueElem = editVariableModalElem.querySelector("#input-variable-value");
    if (!vNameElem || !vValueElem) {
        throw Error("The variable name and/or value element was not found");
    }
    // find the variable object and update it
    // this will update all the variable objects with the identical ID in this scheme.
    // The variables outside this scheme will not be affected.
    for (var _i = 0, _a = scheme.data.processes; _i < _a.length; _i++) {
        var eachProcess = _a[_i];
        for (var _b = 0, _c = eachProcess.data.inputVars; _b < _c.length; _b++) {
            var eachInput = _c[_b];
            if (eachInput.data.id == vID) {
                eachInput.data.name = vNameElem.value;
                eachInput.data.value = vValueElem.value;
            }
        }
    }
    electron_1.ipcRenderer.send("updateScheme", scheme);
    // hide the modal
    editVariableModalElem.removeAttribute("data-variable-id");
    bootVariableModal.hide();
}
function runScheme() {
    electron_1.ipcRenderer.send("runScheme", schemeID);
}
function goToHome() {
    electron_1.ipcRenderer.send("goToHome");
}
