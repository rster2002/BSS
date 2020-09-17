module.exports = function(args, context) {
    var [selector] = args;

    return `execute as ${selector} at @s`;
}