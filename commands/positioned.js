module.exports = function (args, context) {
    const [x, y, z] = args;
    return `execute positioned ${x} ${y} ${z}`;
}