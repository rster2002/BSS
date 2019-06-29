module.exports = function(words, condig, extra) {
    words.shift();

    var { layer, genCmd } = extra;
    layer++;
    
    var mode = words.shift();

    if (mode === "trigger") {
        var scoreboard = words[0];
        var enabledFor = words[1];

        return `scoreboard objectives add ${scoreboard} trigger
            scoreboard players enable ${enabledFor} ${scoreboard}
            execute as @a[scores={${scoreboard}=1..}] ${genCmd(layer)}
            scoreboard players set @a[scores={${scoreboard}=1..}] ${scoreboard} 0`
    }
}