const { match } = require("assert");

function deflateBodies(input, context) {
    const { buildContext } = context;
    
    var match = buildContext.tools.balancedMatch("{", "}", input);
    while (match) {
        let id = context.addBody(match.body);
        input = input.replace(`{${match.body}}`, id);

        match = buildContext.tools.balancedMatch("{", "}", input);
    }

    return input;
}

function inflateBodies(input, context) {
    var entries = Object.entries(context.bodies);

    for (var [id, body] of entries) {
        input = input.replace(id, `{${body}}`);
    }

    return input;
}

module.exports = {
    deflateBodies,
    inflateBodies,
}