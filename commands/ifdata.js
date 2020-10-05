function processDataExpression(context, dataExpression) {
    const words = dataExpression.split(" ");
    var leftSideTarget = words.shift();

    // Check whether or not the leftSide is a selector and if not, interpret it as a block
    if (!context.isSelector(leftSideTarget)) {
        leftSideTarget = `block ${leftSideTarget} ${words.shift()} ${words.shift()}`;
    } else {
        leftSideTarget = `entity ${leftSideTarget}`;
    }

    // Get the leftSidePath
    var leftSidePath = words.shift();

    // Get the operator
    var operator = words.shift();
    var rightSideTarget = words.shift();

    
    // Check whether or not the rightSide is a selector and if not, interpret it as a block
    if (operator === "matches") {
        // Add the target back to the words because the target is the path
        words.unshift(rightSideTarget);
    } else if (!context.isSelector(rightSideTarget)) {
        rightSideTarget = `block ${rightSideTarget} ${words.shift()} ${words.shift()}`;
    } else {
        rightSideTarget = `entity ${rightSideTarget}`;
    }

    // Get the rightSidePath
    var rightSidePath = words.shift();

    // Get the hash for the expression
    const expressionHash = context.buildContext.tools.quickHash(dataExpression);
    const store = "t" + expressionHash;
    const scoreboard = "s" + expressionHash;

    const commands = [];
    commands.push(`scoreboard objectives add ${scoreboard} dummy`);

    // Process the operators
    if (operator === "==") {
        commands.push(`data modify storage ${store} Value set from ${leftSideTarget} ${leftSidePath}
        execute store success score Success ${scoreboard} run data modify storage ${store} Value set from ${rightSideTarget} ${rightSidePath}
        execute if score Success ${scoreboard} matches 0 <continue>`);
    } else if (operator === "matches") {
        commands.push(`data modify storage ${store} Value set from ${leftSideTarget} ${leftSidePath}
        execute store success score Success ${scoreboard} run data modify storage ${store} Value set value ${rightSidePath}
        execute if score Success ${scoreboard} matches 0 <continue>`);
    } else {
        return context.error("Invalid operator", "ifdata");
    }

    // Remove the scoreboard after the operation
    if (context.config.removeTempScoreboards) commands.push(`scoreboard objectives remove ${scoreboard}`);

    return commands;
}

module.exports = function (args, context) {
    const dataExpression = args.join(" ");
    const operationCommands = processDataExpression(context, dataExpression);

    return operationCommands;
}