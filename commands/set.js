module.exports = function (args, context) {
    return `set ${args.join(" ")}`;
}