const replaceAll = require("./replaceAll.js");

function deflateSelectors(input, context) {
    var expression = /\@[parse](\[.+\])?/;

    while (input.match(expression)) {
        let match = input.match(expression)[0];
        let id = context.addSelector(match);

        input = input.replace(match, id);
    }

    return input;
}

function inflateSelectors(input, context) {
    var entries = Object.entries(context.selectors);

    for (var [id, selector] of entries) {
        input = replaceAll(input, id, selector);
    }

    return input;
}

module.exports = {
    deflateSelectors,
    inflateSelectors,
}