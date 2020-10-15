module.exports = function(args, context) {
    const { buildContext } = context;
    const processFile = require("../utils/processFile.js");

    // Get the function definition including the arguments
    var functionDefinition = args.join(" ");
    var argumentString = buildContext.tools.balancedMatch("(", ")", functionDefinition);

    var id = "";
    var functionArgs = [];

    // Get the passed arguments
    if (argumentString) {
        id = functionDefinition.replace(`(${argumentString.body})`, "");
        functionArgs = argumentString.body.split(",")
            .map(argument => argument.trim());
    } else {
        id = functionDefinition;
    }

    // Get the filled-in body using the id and arguments provided
    var body = context.callFunction(id, functionArgs);
    var processedBody = processFile(body, context);

    // If the option 'splitFunctionsIntoFiles' is set to true, every call will create a separate file, otherwise it will return it like normal
    if (context.config.splitFunctionsIntoFiles) {
        let fileName = context.namespaceHash(processedBody);
    
        const output = context.createOutput(`./${fileName}.mcfunction`);
        output.write(processedBody);
    
        return `function ${context.config.namespace}:${fileName}`;
    } else {
        return processedBody;
    }
}