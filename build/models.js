"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = exports.Process = exports.ProcessType = exports.Scheme = void 0;
var Scheme = /** @class */ (function () {
    function Scheme(data) {
        // Make sure the processes are recognised as Process[] instead of simply an array of objects
        // to allow running class functions
        var processes = [];
        for (var _i = 0, _a = data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            var thisProcess = new Process(eachProcess.data);
            processes.push(thisProcess);
        }
        var variables = [];
        for (var _b = 0, _c = data.variables; _b < _c.length; _b++) {
            var eachVar = _c[_b];
            var newVar = new Variable(eachVar.data);
            variables.push(newVar);
        }
        // Replace the proesses data with the new one we just made
        data.processes = processes;
        data.variables = variables;
        this.data = data;
    }
    /**
     * Runs the scheme by running each of its processes.
     */
    Scheme.prototype.runScheme = function () {
        for (var _i = 0, _a = this.data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            eachProcess.runProcess(this);
        }
    };
    Object.defineProperty(Scheme.prototype, "allVariables", {
        /**
         * Returns all the variables that belong to any of this scheme's processses.
         */
        get: function () {
            return this.data.variables;
        },
        enumerable: false,
        configurable: true
    });
    Scheme.prototype.variableWithID = function (id) {
        for (var _i = 0, _a = this.allVariables; _i < _a.length; _i++) {
            var eachVar = _a[_i];
            if (eachVar.data.id == id) {
                return eachVar;
            }
        }
        if (id == Variable.emptyID) {
            return Variable.emptyVariable();
        }
        throw Error("Variable with ID " + id + " was not found");
    };
    Scheme.prototype.processWithID = function (id) {
        for (var _i = 0, _a = this.data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            if (eachProcess.data.id == id) {
                return eachProcess;
            }
        }
        throw Error("Could not find process with ID: " + id);
    };
    Scheme.prototype.processIndex = function (id) {
        for (var i = 0; i < this.data.processes.length; i++) {
            var eachProcess = this.data.processes[i];
            if (eachProcess.data.id == id) {
                return i;
            }
        }
        throw Error("Process index could not be found for id: " + id);
    };
    Scheme.prototype.deleteProcess = function (processID) {
        // find the process index
        var processIndex = this.processIndex(processID);
        // delete the process from the processes array
        this.data.processes.splice(processIndex, 1);
    };
    Scheme.prototype.variableIndex = function (id) {
        var indices = [];
        for (var i = 0; i < this.data.variables.length; i++) {
            if (this.data.variables[i].data.id == id) {
                indices.push(i);
            }
        }
        if (indices.length == 1) {
            return indices[0];
        }
        if (indices.length > 1) {
            throw Error("Found " + indices.length + " variables with ID: " + id);
        }
        throw Error("No variable found with ID: " + id);
    };
    Scheme.prototype.deleteVariable = function (variableID) {
        // delete the variable from the variables field
        var varIndex = this.variableIndex(variableID);
        this.data.variables.splice(varIndex, 1);
        this._removeVariableRefs(variableID);
    };
    /**
     * replaces any reference to a variable from a processes with an empty variable
     * @param variableID
     */
    Scheme.prototype._removeVariableRefs = function (variableID) {
        for (var j = 0; j < this.data.processes.length; j++) {
            var eachProcess = this.data.processes[j];
            for (var i = 0; i < eachProcess.data.inputVarIDs.length; i++) {
                var id = eachProcess.data.inputVarIDs[i];
                if (id == variableID) {
                    this.data.processes[j].data.inputVarIDs[i] = Variable.emptyID;
                }
            }
            for (var i = 0; i < eachProcess.data.outputVarIDs.length; i++) {
                var id = eachProcess.data.outputVarIDs[i];
                if (id == variableID) {
                    this.data.processes[j].data.outputVarIDs[i] = Variable.emptyID;
                }
            }
        }
    };
    return Scheme;
}());
exports.Scheme = Scheme;
var ProcessType;
(function (ProcessType) {
    ProcessType[ProcessType["openURLInBrowser"] = 0] = "openURLInBrowser";
    ProcessType[ProcessType["dummy"] = 1] = "dummy";
    ProcessType[ProcessType["invalid"] = 2] = "invalid";
})(ProcessType || (ProcessType = {}));
exports.ProcessType = ProcessType;
var processTypesStore = [
    {
        typeName: "openURLInBrowser",
        typeLabel: "Open URL in Browser",
        inputLabels: ["URL"],
        outputLabels: [],
    },
    {
        typeName: "dummy",
        typeLabel: "Dummy",
        inputLabels: ["dummy input 1", "input2", "input3"],
        outputLabels: ["output1", "outpu2"],
    },
    {
        typeName: "invalid",
        typeLabel: "INVALID",
        inputLabels: [],
        outputLabels: [],
    },
];
var Process = /** @class */ (function () {
    function Process(data) {
        // Make sure input/output vars and process type are recognised as class objects / enum instead of simple objects
        // to allow running suitable functions etc.
        this.data = data;
    }
    Object.defineProperty(Process.prototype, "processTypeData", {
        /**
         * Returns the information related to this process type by reading the processTypesStore.
         */
        get: function () {
            return processTypesStore[this.data.processType];
        },
        enumerable: false,
        configurable: true
    });
    Process.prototype.inputVariables = function (scheme) {
        var inputVars = [];
        for (var _i = 0, _a = this.data.inputVarIDs; _i < _a.length; _i++) {
            var inputID = _a[_i];
            inputVars.push(scheme.variableWithID(inputID));
        }
        return inputVars;
    };
    Process.prototype.outputVariables = function (scheme) {
        var outputVars = [];
        for (var _i = 0, _a = this.data.outputVarIDs; _i < _a.length; _i++) {
            var outputID = _a[_i];
            outputVars.push(scheme.variableWithID(outputID));
        }
        return outputVars;
    };
    /**
     * Runs this process based on its process type.
     */
    Process.prototype.runProcess = function (scheme) {
        console.log("Running process: " + this.data.processName);
        if (this.isInvalidProcess()) {
            throw Error("Tried to run an invalid process");
        }
        var processType = this.data.processType;
        // Find input and output Variable objects
        var inputVars = this.inputVariables(scheme);
        var outputVars = this.outputVariables(scheme);
        if (!(inputVars.length == processTypesStore[processType].inputLabels.length &&
            outputVars.length == processTypesStore[processType].outputLabels.length)) {
            throw Error("N. of inputs or outputs is incorrect");
        }
        switch (processType) {
            case ProcessType.openURLInBrowser:
                var url_1 = inputVars[0].data.value;
                if (typeof url_1 == "string") {
                    var urlPromise = require("electron").shell.openExternal(url_1);
                    urlPromise.then(function (value) {
                        // if successful
                    }, function (reason) {
                        console.log("URL (" + url_1 + ") could not be opened for ");
                        console.log(reason);
                    });
                }
                break;
            case ProcessType.dummy:
                console.log("Running dummy process");
                break;
            default:
                throw Error("The process type could not be determined");
        }
    };
    Process.prototype.isInvalidProcess = function () {
        return this.data.processType == ProcessType.invalid;
    };
    Object.defineProperty(Process, "allProcessTypes", {
        get: function () {
            return processTypesStore;
        },
        enumerable: false,
        configurable: true
    });
    Process.processTypeNum = function (typeName) {
        for (var i = 0; i < processTypesStore.length; i++) {
            if (processTypesStore[i].typeName == typeName) {
                return i;
            }
        }
        throw Error("Process Type number could not be found for: " + typeName);
    };
    return Process;
}());
exports.Process = Process;
var Variable = /** @class */ (function () {
    function Variable(data) {
        this.data = data;
    }
    Variable.emptyVariable = function () {
        return new Variable({
            name: "EMPTY",
            value: null,
            id: Variable.emptyID,
        });
    };
    Variable.emptyIDs = function (num) {
        var ids = [];
        for (var i = 0; i < num; i++) {
            ids.push(Variable.emptyID);
        }
        return ids;
    };
    Object.defineProperty(Variable.prototype, "isEmpty", {
        get: function () {
            return this.data.id == Variable.emptyID;
        },
        enumerable: false,
        configurable: true
    });
    Variable.prototype.nUsage = function (scheme) {
        var counter = 0;
        for (var _i = 0, _a = scheme.data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            for (var _b = 0, _c = [eachProcess.data.inputVarIDs, eachProcess.data.outputVarIDs]; _b < _c.length; _b++) {
                var varIDArray = _c[_b];
                for (var _d = 0, varIDArray_1 = varIDArray; _d < varIDArray_1.length; _d++) {
                    var id = varIDArray_1[_d];
                    if (this.data.id == id) {
                        counter++;
                    }
                }
            }
        }
        return counter;
    };
    Variable.prototype.nProcesses = function (scheme) {
        var counter = 0;
        for (var _i = 0, _a = scheme.data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            var found = false;
            for (var _b = 0, _c = [eachProcess.data.inputVarIDs, eachProcess.data.outputVarIDs]; _b < _c.length; _b++) {
                var varIDArray = _c[_b];
                for (var _d = 0, varIDArray_2 = varIDArray; _d < varIDArray_2.length; _d++) {
                    var id = varIDArray_2[_d];
                    if (this.data.id == id && !found) {
                        counter++;
                        found = true;
                    }
                }
            }
        }
        return counter;
    };
    Variable.emptyID = "empty-id";
    return Variable;
}());
exports.Variable = Variable;
