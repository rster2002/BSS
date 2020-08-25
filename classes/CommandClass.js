const { cleanup } = require("../utils/textUtils.js");
const { EOL } = require("os");
const { deflateBodies } = require("../utils/bodyUtils.js");
const path = require("path");

module.exports = class CommandClass {
    constructor(id, body, context) {
        this.context = context;

        this.id = id;
        this.body = body;
        this.methods = this.parseBody(this.body);
    }

    parseBody(body) {
        const processFile = require("../utils/processFile.js");
        const { context } = this;

        var methods = {};
        
        body = deflateBodies(body, context);
        body = cleanup(body);

        var lines = body.split(EOL);
        lines = lines.filter(line => line !== "");

        console.log(lines);

        for (var line of lines) {
            line = cleanup(line);
            let words = line.split(" ");
            let [methodName, bodyId] = words;

            console.log(methodName, bodyId);

            methods[methodName] = processFile(
                context.getBody(bodyId),
                context,
            );
        }

        return methods;
    }

    tickBodyFunction() {
        const { context } = this;
        const body = this.methods.tick;

        if (!body) return "";

        const output = context.write(body);
        return `function ${output.functionLocation}`;
    }
}