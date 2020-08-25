const commandsMap = require("../commands.js");
const { deflateSelectors, inflateSelectors } = require("./selectorUtils.js");

module.exports = function processCommand(command, context, lineIndex = 0) {
    // Cleanup command and check for continuing commands
    command = command.trim();
    var commands = command.split(" run ");

    // If the line consists of multiple command, recursively call the processCommand function
    if (commands.length > 1) {
        return commands
            .map((command, index) => processCommand(command, context, index))
            .join(" run ");
    }

    // If the command is a bodyId, process it and write to a separate file
    if (context.getBody(command)) {
        const processFile = require("../utils/processFile.js");
        const { buildContext } = context;
        let body = context.getBody(command);

        return context.writeFunction(processFile(body, context));
    }

    // Deflate the selectors into single 'words' for better pattern handling
    command = deflateSelectors(command, context);

    // Get the required info from the command
    var [keyword, ...args] = command.split(" ");
    var match = commandsMap[keyword];

    // If the keyword matches a command process it
    if (match) {
        let returnValue = match(args, context);
        returnValue = inflateSelectors(returnValue, context);

        // If the return value is multiple and it's not rooted at the beginning of the line, write it into its own function
        if (!returnValue) return "";
        if (returnValue.includes("\n") && lineIndex !== 0) {
            return context.writeFunction(returnValue);
        } else {
            return returnValue;
        }
    }

    // If there is no match, inflate the selectors and return the command as it was received
    command = inflateSelectors(command, context);
    return command;
}