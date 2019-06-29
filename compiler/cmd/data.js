module.exports = function (words, config, extra) {
    // 1: operation
    // 3: Selector
    // 4: Nbt Path
    // 9: data type (byte, float etc)
    // 10: scale
    // 11: scoreboard
    if (words[1] === "modify") {
        let shift = 0;

        if (words[2] === "block") {
            shift = 2;
        }

        if (words[6 + shift] === "from" && words[7 + shift] === "entity" && words[8 + shift] === "score") {
            if (words[2] === "entity") {
                return `execute as ${words[3 + shift]} store result entity @s ${words[4 + shift]} ${words[9 + shift]} ${words[10 + shift]} run scoreboard players get @s ${words[11 + shift]}`;
            } else if (words[2] === "block") {
                // data modify block ~ ~-3 ~ Items[0].Count set from entity score int 1 buyCount
                return `execute store result block ${words[3]} ${words[4]} ${words[5]} ${words[6]} ${words[11]} ${words[12]} run scoreboard players get @s ${words[14]}`
            } else {
                return words.join(" ");
            }
        } else {
            return words.join(" ");
        }
    } else if (words[1] === "compare") {
      
        words.shift();
        words.shift();

        var { genCmd, layer } = extra;

        var dataSections = words.join(" ");
        dataSections = dataSections.split(" to ");
       
        var locations = { pos1: "~ 0 ~", pos2: "~ 0 ~1" };
        var restoreBlock = "minecraft:bedrock";
            
        if (config.compareCache !== undefined) {
            locations = Object.assign(locations, config.compareCache)
        }

        if (config.compareRestoreBlock !== undefined) {
            restoreBlock = config.compareRestoreBlock;
        }

        console.log(dataSections);

        return `execute at @s run setblock ${locations.pos1} dropper
        execute at @s run setblock ${locations.pos2} dropper
        execute at @s run data merge block ${locations.pos1} {Items: [{id: "minecraft:dirt", Count: 1b, tag: {}}]}
        execute at @s run data merge block ${locations.pos2} {Items: [{id: "minecraft:dirt", Count: 1b, tag: {}}]}
        execute at @s run data modify block ${locations.pos1} Items[0].tag.value set from ${dataSections[0]}
        execute at @s run data modify block ${locations.pos2} Items[0].tag.value set from ${dataSections[1]}
        execute at @s if blocks ${locations.pos1} ${locations.pos1} ${locations.pos2} all ${genCmd(layer + 1)}
        execute at @s run setblock ${locations.pos1} ${restoreBlock}
        execute at @s run setblock ${locations.pos2} ${restoreBlock}`

    } else {
        return words.join(" ");
    }
}