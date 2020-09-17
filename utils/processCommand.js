const commandsMap = require("../commands.js");
const InvalidSyntaxError = require("../classes/InvalidSyntaxError.js");
const InvalidValueError = require("../classes/InvalidValueError.js");
const { deflateSelectors, inflateSelectors } = require("./selectorUtils.js");
const replaceAll = require("./replaceAll.js");

module.exports = function processCommand(command, context, lineIndex = 0) {
    // Get buildContext
    const { buildContext } = context;

    // Cleanup command and check for continuing commands
    command = command.trim();
    var commands = command.split(" run ");

    // If the line consists of multiple command, recursively call the processCommand function
    if (commands.length > 1) {
        let lastSection = "";
        commands.forEach((command, index) => {
            var processedCommand = processCommand(command, context, index);

            // If the last section contains a continue block, paste the command into that block
            if (lastSection.includes("<continue>")) {
                lastSection = replaceAll(lastSection, "<continue>", "run " + processedCommand);
            } else {
                lastSection += (index > 0 ? " run " : "") + processedCommand;
            }
        });

        return lastSection;
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
        try {
            let returnValue = match(args, context);
            returnValue = inflateSelectors(returnValue, context);
            
            // If the return value is multiple and it's not rooted at the beginning of the line, write it into its own function
            if (!returnValue) return "";
            if (returnValue.includes("\n") && lineIndex !== 0) {
                return context.writeFunction(returnValue);
            } else {
                return returnValue;
            }
        } catch(error) {
            if (error instanceof InvalidSyntaxError || error instanceof InvalidValueError) {
                buildContext.consoleOutput.warn(error.message);
            } else {
                buildContext.consoleOutput.error(error.message);
            }
        }
    }

    // If there is no match, inflate the selectors and return the command as it was received
    command = inflateSelectors(command, context);
    return command;
}