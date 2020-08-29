const asCommand = require("./commands/as.js");
const scoreCommand = require("./commands/score.js");
const defineCommand = require("./commands/define.js");
const callCommand = require("./commands/call.js");
const classCommand = require("./commands/class.js");
const applyCommand = require("./commands/apply.js");
const commentCommand = require("./commands/comment.js");
const functionCommand = require("./commands/function.js");
const ifCommand = require("./commands/if.js");

module.exports = {
    as: asCommand,
    score: scoreCommand,
    define: defineCommand,
    call: callCommand,
    class: classCommand,
    apply: applyCommand,
    function: functionCommand,
    if: ifCommand,
    "#": commentCommand,
}