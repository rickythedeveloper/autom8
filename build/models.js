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
        // Replace the proesses data with the new one we just made
        data.processes = processes;
        this.data = data;
    }
    /**
     * Runs the scheme by running each of its processes.
     */
    Scheme.prototype.runScheme = function () {
        for (var _i = 0, _a = this.data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            eachProcess.runProcess();
        }
    };
    Object.defineProperty(Scheme.prototype, "allVariables", {
        /**
         * Returns all the variables that belong to any of this scheme's processses.
         */
        get: function () {
            var vars = [];
            var IDs = [];
            for (var _i = 0, _a = this.data.processes; _i < _a.length; _i++) {
                var eachProcess = _a[_i];
                for (var _b = 0, _c = [eachProcess.data.inputVars, eachProcess.data.outputVars]; _b < _c.length; _b++) {
                    var varArray = _c[_b];
                    for (var _d = 0, varArray_1 = varArray; _d < varArray_1.length; _d++) {
                        var eachVar = varArray_1[_d];
                        if (!IDs.includes(eachVar.data.id)) {
                            vars.push(eachVar);
                            IDs.push(eachVar.data.id);
                        }
                    }
                }
            }
            return vars;
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
        data.inputVars = this.recoverVariables(data.inputVars);
        data.outputVars = this.recoverVariables(data.outputVars);
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
    /**
     * Given a data object representing an array of Variable object,
     * returns the array of actual Variable objects, not data objects.
     * @param variables
     */
    Process.prototype.recoverVariables = function (variables) {
        var vars = [];
        for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
            var eachVar = variables_1[_i];
            var thisVar = new Variable(eachVar.data);
            vars.push(thisVar);
        }
        return vars;
    };
    /**
     * Runs this process based on its process type.
     */
    Process.prototype.runProcess = function () {
        console.log("Running process: " + this.data.processName);
        if (this.isInvalidProcess()) {
            throw Error("Tried to run an invalid process");
        }
        var processType = this.data.processType;
        var inputVars = this.data.inputVars;
        var outputVars = this.data.outputVars;
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
            id: "empty-id",
        });
    };
    Object.defineProperty(Variable.prototype, "isEmpty", {
        get: function () {
            return this.data.id == "empty-id";
        },
        enumerable: false,
        configurable: true
    });
    return Variable;
}());
exports.Variable = Variable;
