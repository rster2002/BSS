const replaceAll = require("../utils/replaceAll.js");

module.exports = class Function {
    constructor(id, body, params) {
        this.id = id;
        this.body = body;
        this.params = params;
    }

    resolve(args) {
        args = args.filter(arg => arg !== "");
        var body = this.body;

        if (args.length < this.params.length) return `> # Function required ${this.params.length} arguments but got ${args.length}.`;

        for (var i = 0; i < this.params.length; i++) {
            var param = this.params[i];
            var arg = args[i];

            body = replaceAll(body, `$${param}`, arg);
        }

        return body;
    }
}