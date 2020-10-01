const path = require("path");

const Function = require("../classes/Function.js");
const Scope = require("./Scope.js");

const replaceAll = require("../utils/replaceAll.js");
const { cleanup } = require("../utils/textUtils.js");
const InvalidValueError = require("./InvalidValueError.js");

module.exports = class Context {
    constructor(buildContext, config) {
        this.buildContext = buildContext;
        this.config = config;

        this.scope = new Scope();
        this.bodies = {};
        this.selectors = {};
        this.functions = {};
        this.classes = {};
        this.scoreboards = {};

        this.setupFileOutput = this.config.writeSetupFile ? buildContext.output.createOutput(path.resolve(this.getRoot(), "./setup.mcfunction")) : null;
    }

    error(message = "An unexpected error accrued", location = "Error") {
        this.buildContext.consoleOutput.error(`${location} > ${message}`);
        return location + " > # " + message;
    }

    setScope(scope = new Scope()) {
        this.scope = scope;
    }

    isSelector(selector) {
        return this.selectors[selector] !== undefined;
    }
    
    addSelector(selector) {
        var id = "selector-" + this.buildContext.tools.quickHash(selector);
        this.selectors[id] = selector;

        return id;
    }

    addBody(body) {
        var id = "body-" + this.buildContext.tools.quickHash(body);
        this.bodies[id] = body;

        return id;
    }

    evalArguments(string, args = {}) {
        for (var [key, value] of Object.entries(args)) {
            string = replaceAll(string, "$" + key, value);
        }

        return string;
    }

    isBody(id) {
        return this.bodies[id] !== undefined;
    }

    getBody(id, args = null) {
        var bodyContent = this.bodies[id];

        if (args) {
            bodyContent = this.evalArguments(bodyContent, args);
        }

        return cleanup(bodyContent);
    }

    addFunction(id, body, params) {
        this.functions[id] = new Function(id, body, params);
    }

    callFunction(id, args) {
        var match = this.functions[id];

        if (match) {
            return match.resolve(args);
        } else {
            throw new InvalidValueError("functionCall", `Function '${id}' was not defined. Skipping call.`);
            // this.buildContext.consoleOutput.warn(`Function '${id}' was not defined. Skipping call.`);
            // return "> # Function call was skipped. Not defined.";
        }
    }

    addClass(commandClass) {
        this.classes[commandClass.id] = commandClass;
    }

    addScoreboard(name) {
        if (this.scoreboards[name] === undefined) {
            this.scoreboards[name] = true;

            if (this.setupFileOutput) {
                this.setupFileOutput.append(`scoreboard objectives add ${name} dummy\n`);
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    getRoot() {
        var rawConfig = this.buildContext.config.rawConfig;
        var outputDir = rawConfig.outputDir;

        return outputDir;
    }

    createOutput(fileName) {
        var outputDir = this.getRoot();
        var { generatedFilePath } = this.config;

        return this.buildContext.output.createOutput(path.resolve(outputDir, generatedFilePath, fileName));
    }

    write(data) {
        const { buildContext } = this;
        const fileName = buildContext.tools.quickHash(data);
        const output = this.createOutput(`${fileName}.mcfunction`);

        output.functionLocation = this.config.namespace + ":" + replaceAll(output.relativePath, path.sep, "/").replace(".mcfunction", "");
        
        data = cleanup(data);

        output.write(data);
        return output;
    }

    writeFunction(data) {
        const output = this.write(data);
        return `function ${output.functionLocation}`;
    }
}