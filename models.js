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
}

const ProcessType = {
    openURLInBrowser: 'openURLInBrowser',
}

class Process {
    constructor(processName, type, url) {
        this.processName = processName
        if (type in ProcessType) {
            this.type = type
        } else {
            console.log('Invalid process type when initialising a Process object ' + type)
        }
        this.url = url
    }
}

module.exports = { Scheme, Process, ProcessType}