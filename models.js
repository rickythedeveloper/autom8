const { v4: uuidv4 } = require('uuid');

class Scheme {
    constructor(schemeName, id=null, processes=[]) {
        this.schemeName = schemeName
        if (id == null) {
            this.id = uuidv4()
        } else {
            this.id = id
        }

        this.processes = processes
    }

    runScheme() {
        for (process of this.processes) {
            process.runProcess()
        }
    }
}

const ProcessType = {
    openURLInBrowser: {
        typeName: 'openURLInBrowser',
        nInputs: 1,
        nOutputs: 0,
    },
}

class Process {
    constructor(data) {
        /**
         * data must contain
         * processName: string
         * processType: one item of ProcessType
         * inputVars: [Variable]
         * outputVars: [Variable]
         */
        if (!('processName' in data) || !('processType' in data)) {
            console.log('Process data does not contain mandatory data when the Process object initialised.')
        }
        this.data = data
    }

    runProcess() {
        const processType = this.dataValue('processType')
        if (processType != null) {
            const inputVars = this.dataValue('inputVars')
            if (inputVars.length != processType.nInputs) {
                console.log('N. of inputs is not right')
            }
            const outputVars = this.dataValue('outputVars')
            if (outputVars.length != processType.nOutputs) {
                console.log('N. of outputs is not right')
            } 

            if (inputVars != null) {
                switch (processType) {
                    case ProcessType.openURLInBrowser:
                        if (inputVars.length != 1) {
                            console.log('openURLInBrowser type only accepts one input')
                        }
                        const url = inputVars[0].data.value
                        if (url != null) {
                            require('electron').shell.openExternal(url)
                        }
                        break
                    default:
                        console.log('The process type could not be determined')
                }
            }
        }
    }

    dataValue(key) {
        if (key in this.data) {
            return this.data[key]
        }
        console.log('The process data does not contain: ' + key)
        return null
    }
}

class Variable {
    constructor(data) {
        /**
         * data must contain:
         * name, value
         */
        this.data = data
    }
}

module.exports = { Scheme, Process, ProcessType, Variable}