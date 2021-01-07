interface SchemeData {
	schemeName: string;
	id: string;
	processes: Process[];
	variables: Variable[];
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

		const variables: Variable[] = [];
		for (const eachVar of data.variables) {
			const newVar = new Variable(eachVar.data);
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
	runScheme() {
		for (let eachProcess of this.data.processes) {
			eachProcess.runProcess(this);
		}
	}

	/**
	 * Returns all the variables that belong to any of this scheme's processses.
	 */
	get allVariables(): Variable[] {
		return this.data.variables;
	}

	variableWithID(id: string): Variable {
		for (const eachVar of this.allVariables) {
			if (eachVar.data.id == id) {
				return eachVar;
			}
		}

		if (id == Variable.emptyID) {
			return Variable.emptyVariable();
		}
		throw Error("Variable with ID " + id + " was not found");
	}

	processWithID(id: string): Process {
		for (const eachProcess of this.data.processes) {
			if (eachProcess.data.id == id) {
				return eachProcess;
			}
		}
		throw Error("Could not find process with ID: " + id);
	}

	processIndex(id: string): number {
		for (var i = 0; i < this.data.processes.length; i++) {
			const eachProcess = this.data.processes[i];
			if (eachProcess.data.id == id) {
				return i;
			}
		}
		throw Error("Process index could not be found for id: " + id);
	}

	deleteProcess(processID: string) {
		// find the process index
		const processIndex = this.processIndex(processID);

		// delete the process from the processes array
		this.data.processes.splice(processIndex, 1);
	}
}

enum ProcessType {
	openURLInBrowser = 0,
	dummy,
	invalid,
}

interface ProcessTypeData {
	typeName: string;
	typeLabel: string;
	inputLabels: string[];
	outputLabels: string[];
}

const processTypesStore: ProcessTypeData[] = [
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

interface ProcessData {
	processName: string;
	processType: number;
	id: string;
	inputVarIDs: string[];
	outputVarIDs: string[];
}

class Process {
	data: ProcessData;

	constructor(data: ProcessData) {
		// Make sure input/output vars and process type are recognised as class objects / enum instead of simple objects
		// to allow running suitable functions etc.
		this.data = data;
	}

	/**
	 * Returns the information related to this process type by reading the processTypesStore.
	 */
	get processTypeData() {
		return processTypesStore[this.data.processType];
	}

	inputVariables(scheme: Scheme): Variable[] {
		const inputVars: Variable[] = [];
		for (const inputID of this.data.inputVarIDs) {
			inputVars.push(scheme.variableWithID(inputID));
		}
		return inputVars;
	}

	outputVariables(scheme: Scheme): Variable[] {
		const outputVars: Variable[] = [];
		for (const outputID of this.data.outputVarIDs) {
			outputVars.push(scheme.variableWithID(outputID));
		}
		return outputVars;
	}

	/**
	 * Runs this process based on its process type.
	 */
	runProcess(scheme: Scheme) {
		console.log("Running process: " + this.data.processName);
		if (this.isInvalidProcess()) {
			throw Error("Tried to run an invalid process");
		}
		const processType = this.data.processType;

		// Find input and output Variable objects
		const inputVars = this.inputVariables(scheme);
		const outputVars = this.outputVariables(scheme);

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
				const url = inputVars[0].data.value;
				if (typeof url == "string") {
					const urlPromise = require("electron").shell.openExternal(url);
					urlPromise.then(
						function (value) {
							// if successful
						},
						function (reason) {
							console.log("URL (" + url + ") could not be opened for ");
							console.log(reason);
						}
					);
				}
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

	static get allProcessTypes(): ProcessTypeData[] {
		return processTypesStore;
	}

	static processTypeNum(typeName: string): number {
		for (var i = 0; i < processTypesStore.length; i++) {
			if (processTypesStore[i].typeName == typeName) {
				return i;
			}
		}
		throw Error("Process Type number could not be found for: " + typeName);
	}
}

interface VariableData {
	name: string;
	value: any;
	id: string;
}

class Variable {
	static emptyID = "empty-id";
	data: VariableData;

	constructor(data: VariableData) {
		this.data = data;
	}

	static emptyVariable() {
		return new Variable({
			name: "EMPTY",
			value: null,
			id: Variable.emptyID,
		});
	}

	static emptyIDs(num: number): string[] {
		const ids: string[] = [];
		for (var i = 0; i < num; i++) {
			ids.push(Variable.emptyID);
		}
		return ids;
	}

	get isEmpty() {
		return this.data.id == Variable.emptyID;
	}
}

export { Scheme, ProcessType, ProcessTypeData, ProcessData, Process, VariableData, Variable };
