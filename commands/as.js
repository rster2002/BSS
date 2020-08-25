module.exports = function as(args, context) {
    var [selector] = args;

    return `execute as ${selector}`;
}