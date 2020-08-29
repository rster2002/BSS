function getIntRange(numericValue, operator) {
    numericValue = Number(numericValue);

    switch (operator) {
        case "=":
            return numericValue;

        case ">=":
            return numericValue + "..";

        case "<=":
            return ".." + numericValue;

        case ">":
            return (numericValue + 1) + "..";

        case "<":
            return ".." + (numericValue - 1);

        default:
            return "<invalid operator>";
    }
}

function processExpressionSide(value) {
    if (value === "true") return 1;
    else if (value === "false") return 0;
    else return value;
}

function evaluateExpression(expression) {
    var words = expression.split(" ");

    if (words.length === 1) {
        // If there is only one work in the expression, check whether or not it's value is 1
        let [scoreboard] = words;
        return `if score @s ${scoreboard} matches 1`;
    } else if (words.length === 3) {
        let [leftSide, operator, rightSide] = words;

        // Processed the sides for special cases like true/false
        leftSide = processExpressionSide(leftSide);
        rightSide = processExpressionSide(rightSide);

        // Check whether or not comparing scoreboards or comparing a scoreboard to a numeric value
        let leftSideIsScoreboard = isNaN(leftSide);
        let rightSideIsScoreboard = isNaN(rightSide);

        // Change the '==' operator to '=' operator for use in the comparing
        if (operator === "==") operator = "=";

        if (leftSideIsScoreboard && rightSideIsScoreboard) {
            // If both are scoreboards, just compare them like normal
            if (operator === "!=") return `unless score ${leftSide} = @s ${rightSide}`;
            return `if score @s ${leftSide} ${operator} @s ${rightSide}`
        } else {
            // Get the value of the scoreboard and the value of the number
            let scoreboardValue = leftSideIsScoreboard ? leftSide : rightSide;
            let numericValue = leftSideIsScoreboard ? rightSide : leftSide;

            // Special case because '!=' is not supported by default
            if (operator === "!=") return `unless score ${scoreboardValue} matches ${numericValue}`;

            // Get the intRange and get the executeOperator. This is because you can write 10 > 5 as 5 < 10, so in that case it would result the inverse
            let intRange = getIntRange(numericValue, operator);
            let executeOperator = leftSideIsScoreboard ? "if" : "unless";
            return `${executeOperator} score @s ${scoreboardValue} matches ${intRange}`;
        }
    } else {
        return `> # If statement should match the following pattern: <left side value> <operator> <right side value>`;
    }
}

function inverseCondition(condition) {
    if (condition.includes("if")) return condition.replace("if", "unless");
    else return condition.replace("unless", "if");
}

module.exports = function(args, context) {
    // if i == 10 run 

    args = args.join(" ");
    
    if (args.includes(" && ") && args.includes(" || ")) {
        return "> # Cannot use both the 'or' and 'and' operator within the same condition";
    }

    if (args.includes(" && ")) {
        let sections = args.split(" && ");

        let conditionSection = sections.map(section => evaluateExpression(section))
            .join(" ");

        return `execute ${conditionSection}`;
    } else if (args.includes(" || ")) {
        let sections = args.split(" || ");

        let precondition = [];
        let commands = sections.map(section => evaluateExpression(section))
            .map(conditionSection => {
                var preconditionString = precondition.join(" ");
                var command = `execute ${preconditionString + " " + conditionSection} <continue>`;

                precondition.push(inverseCondition(conditionSection));
                return command;
            })
            .join("\n");

        return commands;
    } else {
        return evaluateExpression(args);
    }
}