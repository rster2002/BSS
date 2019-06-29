module.exports = function (words, config, extra) {
    // compare <path> to <path 2> in <scoreboard>

    words.shift();

    var section = words.join(" ").split(" in ");
    var scoreboard = section[1];
    var operation = section[0].split(" to ");

    var value1 = operation[0];
    var value2 = operation[1];

    console.log(value1, value2);

    return `setblock ~ 0 ~ minecraft:dropper {Items: [{id: "minecraft:dirt", Count: 1b, tag: {value: ""}}]}
    setblock ~1 0 ~ minecraft:dropper {Items: [{id: "minecraft:dirt", Count: 1b, tag: {value: ""}}]}
    data modify block ~ 0 ~ Items[0].tag.value set from ${value1}
    data modify block ~1 0 ~ Items[0].tag.value set from ${value2}
    execute if blocks ~ 0 ~ ~ 0 ~ ~1 0 ~ run scoreboard players set @s ${scoreboard} 1
    setblock ~ 0 ~ minecraft:bedrock
    setblock ~1 0 ~ minecraft:bedrock`
}