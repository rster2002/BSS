const Scope = require("../classes/Scope.js");
const Context = require("../classes/Context.js");
const replaceAll = require("./replaceAll.js");
const processCommand = require("./processCommand.js");
const { deflateBodies, inflateBodies } = require("./bodyUtils.js");
const { EOL } = require("os");
const { cleanup } = require("./textUtils.js");

function processJsExpressions(string, context) {
    const { buildContext } = context;
    
    var match;
    do {
        match = buildContext.tools.balancedMatch("#{", "}", string);

        let body = match.body;
        matchBody = `#{${body}}`;

        let bodyResult = eval(match);
        string.replace(matchBody, bodyResult);
    } while (match);

    return string;
}

module.exports = function processFile(content, context = new Context()) {
    // Removed things like tabs, leading and trailing spaces, and delate bodies for better pattern handling
    content = cleanup(content);
    content = deflateBodies(content, context);
    content = replaceAll(content, "=>" + EOL, "");

    // Split the file into multiple lines
    var lines = content.split("\n");
    lines = lines.map(line => processCommand(line, context))
        .join("\n");

    // Inflate left-over bodies, do final cleanup and return the processed lines
    lines = inflateBodies(lines, context);
    lines = processJsExpressions(lines, context);
    lines = cleanup(lines);
    lines = lines.split("\n").map(line => line.trim()).join("\n");

    return lines;
}