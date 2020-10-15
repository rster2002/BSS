const InvalidSyntaxError = require("../classes/InvalidSyntaxError.js");

const onTick = require("./on/tick.js");
const onTrigger = require("./on/trigger.js");
const onDatachange = require("./on/datachange.js");
const onDatachangehandler = require("./on/datachangehandler.js");

const subCommandMap = {
    tick: onTick,
    trigger: onTrigger,
    datachange: onDatachange,
    datachangehandler: onDatachangehandler,
}

module.exports = function (args, context) {
    const [subCommand, ...subCommandArgs] = args;
    const subCommandFunction = subCommandMap[subCommand];

    if (subCommandFunction) return subCommandFunction(subCommandArgs, context);
    else throw new InvalidSyntaxError("on", `Sub-command '${subCommand}' is not valid`);
}