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

	/**
	 * Runs the scheme by running each of its processes.
	 */
	runScheme() {
		for (let eachProcess of this.data.processes) {
			eachProcess.runProcess();
		}
	}

	/**
	 * Returns all the variables that belong to any of this scheme's processses.
	 */
	get allVariables(): Variable[] {
		const vars: Variable[] = [];
		const IDs: string[] = [];
		for (const eachProcess of this.data.processes) {
			for (const varArray of [eachProcess.data.inputVars, eachProcess.data.outputVars]) {
				for (const eachVar of varArray) {
					if (!IDs.includes(eachVar.data.id)) {
						vars.push(eachVar);
						IDs.push(eachVar.data.id);
					}
				}
			}
		}
		return vars;
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

	/**
	 * Returns the information related to this process type by reading the processTypesStore.
	 */
	get processTypeData() {
		return processTypesStore[this.data.processType];
	}

	/**
	 * Given a data object representing an array of Variable object,
	 * returns the array of actual Variable objects, not data objects.
	 * @param variables
	 */
	recoverVariables(variables: Variable[]) {
		const vars: Variable[] = [];
		for (const eachVar of variables) {
			const thisVar = new Variable(eachVar.data);
			vars.push(thisVar);
		}
		return vars;
	}

	/**
	 * Runs this process based on its process type.
	 */
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
	data: VariableData;

	constructor(data: VariableData) {
		this.data = data;
	}

	static emptyVariable() {
		return new Variable({
			name: "EMPTY",
			value: null,
			id: "empty-id",
		});
	}
}

export { Scheme, ProcessType, ProcessTypeData, ProcessData, Process, VariableData, Variable };
