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
        // Get the query for this html.
        // e.g. edit_scheme.html?schemeID=blah_blah_blah
        var query = querystring_1.default.parse(global.location.search);
        if (query == null) {
            throw Error("No scheme id found (no query was completed when edit scheme page opened");
        }
        // if the scheme ID is in the query, then we find it and return it as long as the type is string as expected.
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
/**
 * Sends a message to the main process and
 * based on the response which is a Scheme object, sets up the page.
 */
function requestDataAndSetupPage() {
    // based on the reply to the data request with scheme id, complete html
    electron_1.ipcRenderer.on("requestSchemeData-reply", function (event, schemeData) {
        scheme = new models_1.Scheme(schemeData.data); // Put the data as a new Scheme object so we can refer to its class functions etc.
        setupPage(scheme);
    });
    // request all the data with the id obtained
    electron_1.ipcRenderer.send("requestSchemeData", schemeID);
}
/**
 * Sets up the page based on the scheme data.
 * @param scheme the scheme object based on which the page will be set up.
 */
function setupPage(scheme) {
    setSchemeName(scheme);
    updateProcessElems(scheme);
    addVariableElems(scheme); // variables elems as inputs / outputs of the processes
    updateVariableSection(scheme); // variables section on the side
}
/**
 * Update the scheme name element
 * @param scheme
 */
function setSchemeName(scheme) {
    var schemeNameElem = document.getElementById("schemeName");
    if (!schemeNameElem) {
        throw Error("Could not find the scheme name element");
    }
    schemeNameElem.innerHTML = scheme.data.schemeName;
}
/**
 * Updates elements representing each process of the given scheme within the #processes element
 * @param scheme
 */
function updateProcessElems(scheme) {
    // Find the #processes element
    var processesElem = document.getElementById("processes");
    if (!processesElem) {
        throw Error("processes element was not found");
    }
    // Empty the element
    processesElem.innerHTML = "";
    // Add each process within that element
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
/**
 * Adds the input/output variable elements around each process.
 * @param scheme
 */
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
/**
 * Returns the input or output variable wrapper given the process
 * @param io An enum member representing whether this wrapper is for inputs or outputs
 * @param theProcess The Process object around which this wrapper will be created.
 */
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
/**
 * Inserts the newNode after the referenceNode in the html.
 * @param referenceNode
 * @param newNode
 */
function insertAfter(referenceNode, newNode) {
    if (!(referenceNode === null || referenceNode === void 0 ? void 0 : referenceNode.parentNode)) {
        throw Error("Could not insert a new node after a reference node. Either the reference node or its parentNode does not exist");
    }
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
/**
 * Returns the html element for a given variable with an optional label
 * @param variable the Variable object
 * @param label The type of the variable e.g. URL, string, picture etc.
 */
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
function setOnClickVariableElem(elem) {
    elem.onclick = function () {
        // Get variable data from html
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
        // Put the info in the modal
        var vNameELem = editVariableModalElem.querySelector(".modal-body #input-variable-name");
        var vValueElem = editVariableModalElem.querySelector(".modal-body #input-variable-value");
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
/**
 * Finds all the variables with the ID found in the modal,
 * and updates them based on the information found in the modal.
 */
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
        for (var _b = 0, _c = [eachProcess.data.inputVars, eachProcess.data.outputVars]; _b < _c.length; _b++) {
            var varArray = _c[_b];
            for (var _d = 0, varArray_1 = varArray; _d < varArray_1.length; _d++) {
                var eachVar = varArray_1[_d];
                if (eachVar.data.id == vID) {
                    eachVar.data.name = vNameElem.value;
                    eachVar.data.value = vValueElem.value;
                }
            }
        }
    }
    electron_1.ipcRenderer.send("updateScheme", scheme);
    // hide the modal
    editVariableModalElem.removeAttribute("data-variable-id");
    bootVariableModal.hide();
}
/**
 * Sends a request to the main process to run this scheme
 */
function runScheme() {
    electron_1.ipcRenderer.send("runScheme", schemeID);
}
/**
 * Sends a request to the main process to go back to the home pgae.
 */
function goToHome() {
    electron_1.ipcRenderer.send("goToHome");
}
