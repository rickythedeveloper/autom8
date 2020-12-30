class Scheme {
	schemeName: string;
	id: string;
	processes: Process[];

	constructor(schemeName: string, id: string, processes: Process[]) {
		this.schemeName = schemeName;
		this.id = id;
		this.processes = processes;
	}

	runScheme() {
		for (let eachProcess of this.processes) {
			eachProcess.runProcess();
		}
	}
}

interface ProcessType {
	typeName: string;
	nInputs: number;
	nOutputs: number;
}

const ProcessTypes = {
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

interface ProcessData {
	processName: string;
	processType: ProcessType;
	id: string;
	inputVars: Variable[];
	outputVars: Variable[];
}

class Process {
	data: ProcessData;

	constructor(data: ProcessData) {
		this.data = data;
	}

	runProcess() {
		if (this.isInvalidProcess()) {
			return;
		}
		const processType = this.data.processType;
		const inputVars = this.data.inputVars;
		const outputVars = this.data.outputVars;
		if (!(inputVars.length == processType.nInputs && outputVars.length == processType.nOutputs)) {
			console.log("N. of inputs or outputs is incorrect");
		}

		switch (processType) {
			case ProcessTypes.openURLInBrowser:
				const url: string = inputVars[0].data.value;
				require("electron").shell.openExternal(url);
				break;
			case ProcessTypes.dummy:
				console.log("Running dummy process");
				break;
			default:
				console.log("The process type could not be determined");
		}
	}

	isInvalidProcess() {
		return this.data.processType.typeName == "invalid";
	}
}

interface VariableData {
	name: string;
	value: any;
	id: string;
}

class Variable {
	data: VariableData;

	constructor(data: VariableData) {
		this.data = data;
	}
}

// module.exports = { Scheme, ProcessTypes, Process, Variable };
export { Scheme, ProcessType, ProcessTypes, ProcessData, Process, VariableData, Variable };
