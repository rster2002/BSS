function deflateJsExpressions(string, context) {
    const { buildContext } = context;

    var match = buildContext.tools.balancedMatch("#{", "}", string);
    while (match) {
        let id = context.trackExpression(match.body);
    }
}

function inflateJsExpression(string, context) {
    
}

module.exports = {
    deflateJsExpressions,
}