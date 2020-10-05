const processFile = require("./utils/processFile.js");
const Context = require("./classes/Context.js");

module.exports = function(inputFile, config) {
    const fileOutput = inputFile.createOutput();
    const { context: buildContext } = inputFile;

    if (!buildContext.bssContext) buildContext.bssContext = new Context(inputFile.context, config);

    
    const processed = processFile(inputFile.data, buildContext.bssContext);

    fileOutput.write(processed);
}