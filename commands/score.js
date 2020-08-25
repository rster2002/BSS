function getScoreboardOperation(scoreName, operation, value) {
    // Find the right command for the operation
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
}

module.exports = function score(args, context) {
    var [scoreName, operation, value] = args;

    var scoreboardOperation = getScoreboardOperation(scoreName, operation, value);

    return `scoreboard objectives add ${scoreName} dummy
    scoreboard players add @s ${scoreName} 0
    ${scoreboardOperation}`
}