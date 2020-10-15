const processFile = require("./utils/processFile.js");
const Context = require("./classes/Context.js");
const path = require("path");

module.exports = function(inputFile, config) {
    const fileOutput = inputFile.createOutput();
    const { context: buildContext } = inputFile;

    if (!buildContext.bssContext) buildContext.bssContext = Context(inputFile.context, config);

    buildContext.files.deleteGlob(path.resolve(buildContext.config.outputDir, config.generatedFilePath, "./*.mcfunction"));
    const processed = processFile(inputFile.data, buildContext.bssContext);

    fileOutput.write(processed);
}