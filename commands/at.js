module.exports = function(args, context) {
    var [selector] = args;

    return `execute at ${selector}`;
}