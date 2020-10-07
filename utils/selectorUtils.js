const replaceAll = require("./replaceAll.js");

function deflateSelectors(input, context) {
    const { buildContext } = context;

    var match = buildContext.tools.balancedMatch("[", "]", input);
    while (match) {
        let id = context.addSelector(match.body);
        input = input.replace(`[${match.body}]`, id);

        match = buildContext.tools.balancedMatch("[", "]", input);
    }

    return input;
}

function inflateSelectors(input, context) {
    var entries = Object.entries(context.selectors);

    for (var [id, selector] of entries) {
        input = replaceAll(input, id, `[${selector}]`);
    }

    return input;
}

module.exports = {
    deflateSelectors,
    inflateSelectors,
}