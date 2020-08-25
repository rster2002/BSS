const Scope = require("./Scope.js");
const genId = require("../utils/genId.js");
const replaceAll = require("../utils/replaceAll.js");
const path = require("path");
const Function = require("../classes/Function.js");

module.exports = class Context {
    constructor(buildContext, config) {
        this.buildContext = buildContext;
        this.config = config;

        this.scope = new Scope();
        this.bodies = {};
        this.selectors = {};
        this.functions = {};
        this.classes = {};
    }

    setScope(scope = new Scope()) {
        this.scope = scope;
    }
    
    addSelector(selector) {
        var id = "selector-" + genId();
        this.selectors[id] = selector;

        return id;
    }

    addBody(body) {
        var id = "body-" + genId();
        this.bodies[id] = body;

        return id;
    }

    getBody(id) {
        return this.bodies[id];
    }

    addFunction(id, body, params) {
        this.functions[id] = new Function(id, body, params);
    }

    callFunction(id, args) {
        var match = this.functions[id];

        if (match) {
            return match.resolve(args);
        } else {
            this.buildContext.consoleOutput.warn(`$Function '${id}' was not defined. Skipping call.`);
            return "> # Function call was skipped. Not defined.";
        }
    }

    addClass(commandClass) {
        this.classes[commandClass.id] = commandClass;
    }

    createOutput(fileName) {
        var rawConfig = this.buildContext.config.rawConfig;
        var outputDir = rawConfig.outputDir;
        var { generatedFilePath } = this.config;

        return this.buildContext.output.createOutput(path.resolve(outputDir, generatedFilePath, fileName));
    }

    write(data) {
        const { buildContext } = this;
        const fileName = buildContext.tools.quickHash(data);
        const output = this.createOutput(`${fileName}.mcfunction`);

        output.functionLocation = this.config.namespace + ":" + replaceAll(output.relativePath, path.sep, "/").replace(".mcfunction", "");
        
        output.write(data);
        return output;
    }

    writeFunction(data) {
        const output = this.write(data);

        return `function ${output.functionLocation}`;
    }
}