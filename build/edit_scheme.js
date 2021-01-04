"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var querystring_1 = __importDefault(require("querystring"));
var models_1 = require("./models");
var html_support_1 = require("./html_support");
var bootstrap_1 = __importDefault(require("bootstrap"));
var uuid_1 = require("uuid");
var editVariableModalElem;
var bootVariableModal;
var bootProcessModal;
var editProcessModalElem;
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
    editVariableModalElem = html_support_1.getElementById("editVariableModal");
    bootVariableModal = new bootstrap_1.default.Modal(editVariableModalElem);
    editProcessModalElem = html_support_1.getElementById("editProcessModal");
    bootProcessModal = new bootstrap_1.default.Modal(editProcessModalElem);
    schemeID = getSchemeId();
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
    updateUI();
    addProcessTypesToModal();
}
function updateUI() {
    updateSchemeName(scheme);
    updateProcessElems(scheme);
    updateVariableElems(scheme); // variables elems as inputs / outputs of the processes
    updateVariableSection(scheme); // variables section on the side
}
/**
 * Update the scheme name element
 * @param scheme
 */
function updateSchemeName(scheme) {
    var schemeNameElem = html_support_1.getElementById("schemeName");
    schemeNameElem.innerHTML = scheme.data.schemeName;
}
/**
 * Updates elements representing each process of the given scheme within the #processes element
 * @param scheme
 */
function updateProcessElems(scheme) {
    // Find the #processes element
    var processesElem = html_support_1.getElementById("processes");
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
        setOnClickProcessElem(processElem);
        processesElem.appendChild(processElem);
    }
}
/**
 * Sets the onclick event for a process element.
 * THis shows a process edit modal which allows user to edit the process.
 * @param elem The process element
 */
function setOnClickProcessElem(elem) {
    elem.onclick = function () {
        // get all info we need
        var pID = elem.id;
        var thisProcess = scheme.processWithID(pID);
        var pNameElem = html_support_1.getElementById("input-process-name");
        var pTypeElem = html_support_1.getElementById("select-process-type");
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
function updateVariableElems(scheme) {
    var variableWrapperClass = "variable-wrapper";
    // Remove the existing variable wrappers
    var currentVWrappers = document.getElementsByClassName(variableWrapperClass);
    var a = currentVWrappers[0];
    for (var i = 0; i < currentVWrappers.length; i++) {
        currentVWrappers[i].remove();
    }
    // Add input and output wrappers for each process.
    for (var _i = 0, _a = scheme.data.processes; _i < _a.length; _i++) {
        var eachProcess = _a[_i];
        var processTypeData = eachProcess.processTypeData;
        var inputWrapper = variableWrapper(VariableIO.input, eachProcess);
        var outputWrapper = variableWrapper(VariableIO.output, eachProcess);
        for (var _b = 0, _c = [inputWrapper, outputWrapper]; _b < _c.length; _b++) {
            var wrapper = _c[_b];
            wrapper.classList.add(variableWrapperClass);
        }
        var processElem = html_support_1.getElementById(eachProcess.data.id);
        if (!processElem.parentNode) {
            throw Error("Either the process element's parentNode is null");
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
    var variablesDiv = html_support_1.getElementById("variables");
    variablesDiv.innerHTML = "";
    var variables = scheme.allVariables;
    for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
        var eachVar = variables_1[_i];
        variablesDiv.appendChild(variableElem(eachVar));
    }
}
function addProcessTypesToModal() {
    var selectElem = html_support_1.getElementById("select-process-type");
    var isFirst = true;
    for (var _i = 0, _a = models_1.Process.allProcessTypes; _i < _a.length; _i++) {
        var eachProcessTypeData = _a[_i];
        var optionElem = document.createElement("option");
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
    // Update the UI
    updateUI();
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
/**
 * Opens the Process modal view so the user can enter the details for a new process.
 */
function addProcess() {
    // Put the info in the modal
    var pNameELem = html_support_1.getElementById("input-process-name");
    var pTypeElem = html_support_1.getElementById("select-process-type");
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
    var newName = html_support_1.getElementById("input-process-name").value;
    var newType = html_support_1.getElementById("select-process-type").value;
    var processTypeNum = models_1.Process.processTypeNum(newType);
    if (editProcessModalElem.getAttribute("data-is-new") == "true") {
        // make inputVars and outputVars arrays with 'empty' Variable objects
        var inputVars = [];
        var nInputs = models_1.Process.allProcessTypes[processTypeNum].inputLabels.length;
        var outputVars = [];
        var nOutputs = models_1.Process.allProcessTypes[processTypeNum].outputLabels.length;
        for (var i = 0; i < nInputs; i++) {
            inputVars.push(models_1.Variable.emptyVariable());
        }
        for (var i = 0; i < nOutputs; i++) {
            outputVars.push(models_1.Variable.emptyVariable());
        }
        // Make a new Process object
        var thisProcess = new models_1.Process({
            processName: newName,
            processType: processTypeNum,
            id: uuid_1.v4(),
            inputVars: inputVars,
            outputVars: outputVars,
        });
        // Add to the scheme
        scheme.data.processes.push(thisProcess);
    }
    else {
        // Find the process
        var processID = html_support_1.getAttribute(editProcessModalElem, "data-process-id");
        editProcessModalElem.removeAttribute("data-process-id");
        var editedProcess = scheme.processWithID(processID);
        // update the process
        editedProcess.data.processName = newName;
        editedProcess.data.processType = processTypeNum;
    }
    // update the scheme data in the main process
    electron_1.ipcRenderer.send("updateScheme", scheme);
    // Update the UI
    updateUI();
    // Set the data-is-new flag to false for next use, and hide the modal
    editProcessModalElem.setAttribute("data-is-new", "false");
    bootProcessModal.hide();
}
