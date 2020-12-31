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
    Scheme.prototype.runScheme = function () {
        for (var _i = 0, _a = this.data.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            eachProcess.runProcess();
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
        inputLabels: ["URL"],
        outputLabels: [],
    },
    {
        typeName: "dummy",
        inputLabels: ["dummy input 1", "input2", "input3"],
        outputLabels: ["output1", "outpu2"],
    },
    {
        typeName: "invalid",
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
        get: function () {
            return processTypesStore[this.data.processType];
        },
        enumerable: false,
        configurable: true
    });
    Process.prototype.recoverVariables = function (variables) {
        var vars = [];
        for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
            var eachVar = variables_1[_i];
            var thisVar = new Variable(eachVar.data);
            vars.push(thisVar);
        }
        return vars;
    };
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
                var url = inputVars[0].data.value;
                require("electron").shell.openExternal(url);
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
    return Process;
}());
exports.Process = Process;
var Variable = /** @class */ (function () {
    function Variable(data) {
        this.data = data;
    }
    return Variable;
}());
exports.Variable = Variable;
