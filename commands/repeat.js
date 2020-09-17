const InvalidSyntaxError = require("../classes/InvalidSyntaxError.js");

module.exports = function(args, context) {
    var [range, optionalVariable, body] = args;
    var optionalVariablePresent = body !== undefined;

    if (!optionalVariablePresent) {
        body = optionalVariable;
    }

    var [min, max] = range.split("..");

    var minIsValid = !isNaN(min);
    var maxIsValid = !isNaN(max);

    if (!minIsValid || !maxIsValid) throw new InvalidSyntaxError("repeat", "Use range format '<min>..<max>'");

    min = Number(min);
    max = Number(max);

    var processedBodies = [];
    for (var i = min; i <= max; i++) {
        let args = {};
        
        if (optionalVariablePresent) {
            args[optionalVariable] = i;
        }

        processedBodies.push(context.getBody(body, args));
    }

    return processedBodies.join("\n");
}