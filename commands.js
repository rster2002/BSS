const asCommand = require("./commands/as.js");
const atCommand = require("./commands/at.js");
const beCommand = require("./commands/be.js");
const scoreCommand = require("./commands/score.js");
const defineCommand = require("./commands/define.js");
const callCommand = require("./commands/call.js");
const classCommand = require("./commands/class.js");
const applyCommand = require("./commands/apply.js");
const commentCommand = require("./commands/comment.js");
const functionCommand = require("./commands/function.js");
const ifCommand = require("./commands/if.js");
const repeatCommand = require("./commands/repeat.js");
const ifDataCommand = require("./commands/ifdata.js");
const positionedCommand = require("./commands/positioned.js");

module.exports = {
    as: asCommand,
    at: atCommand,
    be: beCommand,
    score: scoreCommand,
    define: defineCommand,
    call: callCommand,
    class: classCommand,
    apply: applyCommand,
    function: functionCommand,
    if: ifCommand,
    repeat: repeatCommand,
    ifdata: ifDataCommand,
    positioned: positionedCommand,
    "#": commentCommand,
}