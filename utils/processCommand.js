const commandsMap = require("../commands.js");
const InvalidSyntaxError = require("../classes/InvalidSyntaxError.js");
const InvalidValueError = require("../classes/InvalidValueError.js");
const { deflateSelectors, inflateSelectors } = require("./selectorUtils.js");
const replaceAll = require("./replaceAll.js");

const continueEntity = "<continue>";

function functionResponseToString(args, context, returnValue) {
    const { buildContext } = context;

    // Checks the returned value and processes it accordingly
    if (typeof returnValue === "string") textValue = returnValue;
    else if (Array.isArray(returnValue)) textValue = returnValue.join("\n");
    else if (typeof returnValue === "function") textValue = functionResponseToString(args, context, returnValue(args, context));
    else if (returnValue === null) textValue = "";
    else {
        textValue = "invalid_command_return_value";
        buildContext.consoleOutput.error("Invalid return value for command");
    }

    return textValue;
}

function processResult(context, lineIndex, textValue) {
    if (!textValue) return "";
    if (!textValue.includes(continueEntity) && textValue.includes("\n") && lineIndex !== 0) {
        return context.writeFunction(textValue);
    } else {
        return textValue;
    }
}

module.exports = function processCommand(command, context, lineIndex = 0) {
    // Get buildContext
    const { buildContext } = context;

    // Cleanup command and check for continuing commands
    command = command.trim();
    var commands = command.split(" run ");

    // If the line consists of multiple command, recursively call the processCommand function
    if (commands.length > 1) {
        // Process all commands for later use
        let processedCommands = commands.map((command, arrayIndex) => {
            var lineIndex = commands.length - arrayIndex - 1;
            var processedCommand = processCommand(command, context, lineIndex);

            return processedCommand;
        });

        let processSection = (index = 0) => {
            var command = processedCommands[index];
            var nextCommand = processedCommands[index + 1];

            // Check whether or there is a next command in the queue, and if to, add a continueEntity to the end of the command
            if (!command.includes("\n") && !command.includes(continueEntity) && nextCommand) command += " " + continueEntity;

            // If there is a continueEntity present, replace it with the next command in the queue
            if (command.includes(continueEntity)) command = replaceAll(command, continueEntity, "run " + processSection(index + 1));
            
            // If the command contains multiple lines, put it into it's own function
            if (command.includes("\n") && index > 0) command = context.writeFunction(command);

            return command;
        }

        return processSection();
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
            let textValue = "";

            // Process the multiple ways commands can be returned from commands and inflate left over selectors
            textValue = functionResponseToString(args, context, returnValue);
            textValue = inflateSelectors(textValue, context);

            return textValue;
        } catch(error) {
            if (error instanceof InvalidSyntaxError || error instanceof InvalidValueError) {
                buildContext.consoleOutput.warn(error.message);
            } else if (!context.config.dev) {
                buildContext.consoleOutput.error(error.message);
            } else {
                throw error;
            }
        }
    }

    // If there is no match, inflate the selectors and return the command as it was received
    command = inflateSelectors(command, context);
    return command;
}