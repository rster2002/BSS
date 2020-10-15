const bodyMethods = require("./contextMixins/bodyMethods.js");
const fileMethods = require("./contextMixins/fileMethods.js");
const idMethods = require("./contextMixins/idMethods.js");
const logMethods = require("./contextMixins/logMethods.js");
const scopeMethods = require("./contextMixins/scopeMethods.js");
const selectorMethods = require("./contextMixins/selectorMethods.js");
const textMethods = require("./contextMixins/textMethods.js");
const variableMethods = require("./contextMixins/variableMethods.js");

function Context(buildContext, config) {
    const instance = {};

    instance.config = config;
    instance.buildContext = buildContext;

    instance.text = textMethods(instance);
    instance.id = idMethods(instance);
    instance.scope = scopeMethods(instance);
    instance.log = logMethods(instance);
    instance.body = bodyMethods(instance);
    instance.selector = selectorMethods(instance);
    instance.variable = variableMethods(instance);

    return instance;
}

module.exports = Context;