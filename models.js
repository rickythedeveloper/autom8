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
    openURLInBrowser: 'openURLInBrowser',
}

class Process {
    constructor(data) {
        /*
        data must contain:
        processName, processType

        data can also contain:
        url
        */
        
        if (!('processName' in data) || !('processType' in data)) {
            console.log('Process data does not contain mandatory data when the Process object initialised.')
        }
        this.data = data
    }

    runProcess() {
        const processType = this.dataValue('processType')
        if (processType != null) {
            switch (processType) {
                case ProcessType.openURLInBrowser:
                    const url = this.dataValue('url')
                    if (url != null) {
                        require('electron').shell.openExternal(url)
                    }
                    break
                default:
                    console.log('The process type could not be determined')
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

module.exports = { Scheme, Process, ProcessType}