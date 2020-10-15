function logMethods(instance) {
    return {
        error() {
            instance.buildContext.consoleOutput.error(`${location} > ${message}`);
            return location + " > # " + message;
        },
    }
}

module.exports = logMethods;