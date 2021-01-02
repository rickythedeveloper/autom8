interface SchemeData {
	schemeName: string;
	id: string;
	processes: Process[];
}

class Scheme {
	data: SchemeData;

	constructor(data: SchemeData) {
		// Make sure the processes are recognised as Process[] instead of simply an array of objects
		// to allow running class functions
		const processes: Process[] = [];
		for (const eachProcess of data.processes) {
			const thisProcess = new Process(eachProcess.data);
			processes.push(thisProcess);
		}

		// Replace the proesses data with the new one we just made
		data.processes = processes;
		this.data = data;
	}

	runScheme() {
		for (let eachProcess of this.data.processes) {
			eachProcess.runProcess();
		}
	}

	get allVariables(): Variable[] {
		const vars: Variable[] = [];
		const IDs: string[] = [];
		for (const eachProcess of this.data.processes) {
			for (const varArray of [eachProcess.data.inputVars, eachProcess.data.outputVars]) {
				for (const eachVar of varArray) {
					if (!(eachVar.data.id in IDs)) {
						vars.push(eachVar);
						IDs.push(eachVar.data.id);
					}
				}
			}
		}
		return vars;
	}
}

enum ProcessType {
	openURLInBrowser = 0,
	dummy,
	invalid,
}

interface ProcessTypeData {
	typeName: string;
	inputLabels: string[];
	outputLabels: string[];
}

const processTypesStore: ProcessTypeData[] = [
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
		// Make sure input/output vars and process type are recognised as class objects / enum instead of simple objects
		// to allow running suitable functions etc.
		data.inputVars = this.recoverVariables(data.inputVars);
		data.outputVars = this.recoverVariables(data.outputVars);
		this.data = data;
	}

	get processTypeData() {
		return processTypesStore[this.data.processType];
	}

	recoverVariables(variables: Variable[]) {
		const vars: Variable[] = [];
		for (const eachVar of variables) {
			const thisVar = new Variable(eachVar.data);
			vars.push(thisVar);
		}
		return vars;
	}

	runProcess() {
		console.log("Running process: " + this.data.processName);
		if (this.isInvalidProcess()) {
			throw Error("Tried to run an invalid process");
		}
		const processType = this.data.processType;
		const inputVars = this.data.inputVars;
		const outputVars = this.data.outputVars;
		if (
			!(
				inputVars.length == processTypesStore[processType].inputLabels.length &&
				outputVars.length == processTypesStore[processType].outputLabels.length
			)
		) {
			throw Error("N. of inputs or outputs is incorrect");
		}

		switch (processType) {
			case ProcessType.openURLInBrowser:
				const url: string = inputVars[0].data.value;
				require("electron").shell.openExternal(url);
				break;
			case ProcessType.dummy:
				console.log("Running dummy process");
				break;
			default:
				throw Error("The process type could not be determined");
		}
	}

	isInvalidProcess() {
		return this.data.processType == ProcessType.invalid;
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

export { Scheme, ProcessType, ProcessTypeData, ProcessData, Process, VariableData, Variable };
