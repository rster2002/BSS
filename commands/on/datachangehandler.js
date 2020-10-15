const dataChange = require("./datachange.js");
const replaceAll = require("../../utils/replaceAll.js");

module.exports = function (args, context) {
    var [identifier, ...dataChangeArgs] = args;

    var identifierHash = context.namespaceHash(identifier);
    var dataChangeOutput = dataChange(dataChangeArgs, context);

    return replaceAll(dataChangeOutput, context.continueHash, identifierHash)
}