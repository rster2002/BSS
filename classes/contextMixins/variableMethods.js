function variableMethods(instance) {
    return {
        variableIndicator: "$",
        eval(string, variables) {
            Object.entries(variables)
                .forEach(([name, value]) => {
                    var variableName = variableIndicator + name;
                    instance.text.replaceAll(string, variableName, value);
                });

            return string;
        }
    }
}

module.exports = variableMethods;