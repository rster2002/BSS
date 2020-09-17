module.exports = function(args, context) {
    const { buildContext } = context;

    // Get the body id
    var bodyId = args.pop();
    var functionDefinition = args.join(" ");
    var parameterString = buildContext.tools.balancedMatch("(", ")", functionDefinition);

    bodyId = bodyId.trim();
    var id = "";
    var functionParams = [];
    var body = context.getBody(bodyId); 

    // Process the parameter string and add the parameters to the function definition
    if (parameterString) {
        id = functionDefinition.replace(`(${parameterString.body})`, "");
        functionParams = parameterString.body.split(",")
            .map(parameter => parameter.trim());
    } else {
        id = functionDefinition;
    }

    context.addFunction(id, body, functionParams);
    return null;
}