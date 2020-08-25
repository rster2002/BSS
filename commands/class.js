const CommandClass = require("../classes/CommandClass.js");

module.exports = function(args, context) {
    var [identifier, bodyId] = args;
    var body = context.getBody(bodyId);

    var commandClass = new CommandClass(identifier, body, context);
    context.addClass(commandClass);

    return commandClass.tickBodyFunction();
}