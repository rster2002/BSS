function getScoreboardOperation(scoreName, operation, value) {
    var isNumericValue = !isNaN(value);

    // Find the right command for the operation
    if (isNumericValue) {
        switch (operation) {
            case "=":
                return `scoreboard players set @s ${scoreName} ${value}`;
            
            case "+=":
                return `scoreboard players add @s ${scoreName} ${value}`;
    
            case "-=":
                return `scoreboard players remove @s ${scoreName} ${value}`;
    
            default:
                return "";
        }
    } else {
        return `scoreboard players operation @s ${scoreName} ${operation} @s ${value}`
    }
}

module.exports = function(args, context) {
    const { buildContext } = context;
    var [scoreName, operation, ...expression] = args;

    var shouldAddScoreboard = context.addScoreboard(scoreName);
    var scoreboardInitializer = shouldAddScoreboard ? `scoreboard objectives add ${scoreName} dummy` : "";

    if (expression.length === 1) {
        let [value] = expression;
        let scoreboardOperation = getScoreboardOperation(scoreName, operation, value);
    
        return `${scoreboardInitializer}
        ${scoreboardOperation}`;
    } else if (expression.length === 3) {
        let [leftSide, operator, rightSide] = expression;
        let commands = [];
        let expressionString = expression.join(" ");
        let expressionHash = buildContext.tools.quickHash(expressionString);

        commands.push(`scoreboard objectives add ${expressionHash} dummy`);
        commands.push(getScoreboardOperation(expressionHash, "=", leftSide));
        commands.push(getScoreboardOperation(expressionHash, operator + "=", rightSide));
        commands.push(getScoreboardOperation(scoreName, "=", expressionHash));
        commands.push(`scoreboard objectives remove ${expressionHash}`);

        return commands.join("\n");
    }
}