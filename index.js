const processFile = require("./utils/processFile.js");
const Context = require("./classes/Context.js");

module.exports = function(inputFile, config) {
    const fileOutput = inputFile.createOutput();

    const processed = processFile(inputFile.data, new Context(inputFile.context, config));

    fileOutput.write(processed);
}