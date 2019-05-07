function replaceAll(input, replace, replaced) {
    var re = "";
    var r = input.split(replace);
    for (var i = 0; i < r.length; ++i) {
        if (i !== 0) {
            let p = replaced;
            re += p;
        }

        if (input[i] !== "") {
            re += r[i];
        }
    }

    if (re === "") {
        re = input;
    }
    return re;
}

module.exports = function (words, config, extra) {
    words.shift();

    var { config, genCmd, layer, unpackData, store } = extra;

    layer++;

    var scoreboard = words.shift();
    var range = words.shift();
    var body = genCmd(layer);

    body = unpackData(body, store);
    // console.log(body);

    range = range.split("-");
    var min = range[0];
    var max = range[1];

    var commands = [];

    for (var i = min; i <= max; ++i) {
        var cm = replaceAll(body, "$index", i);
        cm = cm.split(" ");
        cm.shift();
        cm = cm.join(" ");
        commands.push(cm);
    }

    var listLength = commands.length;
    var chunkSize = Math.floor(Math.sqrt(listLength));
    // console.log(listLength, chunkSize);

    var chunks = [];
    var chunkCmds = [];
    var lastMin = 0;

    while (commands.length >= chunkSize) {
        let chunkPath = `bss_generated/optimized_list-chunk-${scoreboard.toLowerCase()}-${range.join("-")}-${lastMin}-${lastMin + chunkSize - 1}`;
        let content = commands.splice(0, chunkSize);

        chunks.push({
            path: chunkPath + ".mcfunction",
            content: content.join("\n")
        });

        chunkCmds.push(`execute as @s[scores={${scoreboard}=${lastMin}..${lastMin + chunkSize - 1}}] run function ${config.namespace}:${chunkPath}`);
        lastMin = lastMin + chunkSize;
    }


    var tailPath = `bss_generated/optimized_list-chunk-${scoreboard.toLowerCase()}-${range.join("-")}-tail`;
    chunks.push({
        path: tailPath + ".mcfunction",
        content: commands.join("\n")
    });

    chunkCmds.push(`execute as @s[scores={${scoreboard}=${lastMin}..}] run function ${config.namespace}:${tailPath}`)

    // console.log(chunkCmds);

    // console.log(commands);

    return {
        content: chunkCmds.join("\n"),
        additionalFiles: chunks
    };
}
