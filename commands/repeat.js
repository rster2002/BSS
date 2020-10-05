const InvalidSyntaxError = require("../classes/InvalidSyntaxError.js");

module.exports = function(args, context) {
    const processFile = require("../utils/processFile.js");

    var [range, optionalVariable, body] = args;
    var optionalVariablePresent = body !== undefined;

    if (!optionalVariablePresent) {
        body = optionalVariable;
    }

    // Format is <n1>..<n2>
    var [min, max] = range.split("..");

    // Check if they're numbers
    var minIsValid = !isNaN(min);
    var maxIsValid = !isNaN(max);

    // If one is not valid, show a error
    if (!minIsValid || !maxIsValid) throw new InvalidSyntaxError("repeat", "Use range format '<min>..<max>'");

    min = Number(min);
    max = Number(max);

    // Check if the min is higher than the max, in which case, it should count down
    let orderRevered = min > max;
    if (orderRevered) {
        let temp = min;
        min = max;
        max = temp;
    }

    var processedBodies = [];
    for (var i = min; i <= max; i++) {
        let args = {};
        
        if (optionalVariablePresent) {
            args[optionalVariable] = i;
        }

        processedBodies.push(processFile(context.getBody(body, args), context));
    }

    return orderRevered ? processedBodies.reverse() : processedBodies;
}