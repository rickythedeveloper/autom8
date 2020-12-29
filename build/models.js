"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = exports.Process = exports.ProcessTypes = exports.Scheme = void 0;
var Scheme = /** @class */ (function () {
    function Scheme(schemeName, id, processes) {
        this.schemeName = schemeName;
        this.id = id;
        this.processes = processes;
    }
    Scheme.prototype.runScheme = function () {
        for (var _i = 0, _a = this.processes; _i < _a.length; _i++) {
            var eachProcess = _a[_i];
            eachProcess.runProcess();
        }
    };
    return Scheme;
}());
exports.Scheme = Scheme;
var ProcessTypes = {
    openURLInBrowser: {
        typeName: "openURLInBrowser",
        nInputs: 1,
        nOutputs: 0,
    },
    dummy: {
        typeName: "dummy",
        nInputs: 3,
        nOutputs: 2,
    },
    invalid: {
        typeName: "invalid",
        nInputs: 0,
        nOutputs: 0,
    },
};
exports.ProcessTypes = ProcessTypes;
var Process = /** @class */ (function () {
    function Process(data) {
        this.data = data;
    }
    Process.prototype.runProcess = function () {
        if (this.isInvalidProcess()) {
            return;
        }
        var processType = this.data.processType;
        var inputVars = this.data.inputVars;
        var outputVars = this.data.outputVars;
        if (!(inputVars.length == processType.nInputs &&
            outputVars.length == processType.nOutputs)) {
            console.log("N. of inputs or outputs is incorrect");
        }
        switch (processType) {
            case ProcessTypes.openURLInBrowser:
                var url = inputVars[0].data.value;
                require("electron").shell.openExternal(url);
                break;
            case ProcessTypes.dummy:
                console.log("Running dummy process");
                break;
            default:
                console.log("The process type could not be determined");
        }
    };
    Process.prototype.isInvalidProcess = function () {
        return this.data.processType.typeName == "invalid";
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
