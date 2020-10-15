module.exports = function (args, context) {
    const [scoreboard, selector = "@s"] = args;

    return `scoreboard objectives add ${scoreboard} trigger
            scoreboard players enable ${selector} ${scoreboard}
            execute as ${selector}[scores={${scoreboard}=1..}] <continue>
            scoreboard players set ${selector}[scores={${scoreboard}=1..}] ${scoreboard} 0`
}