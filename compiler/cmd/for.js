module.exports = function(words, config, extra) {

    var { store, runLines, runBlocksOnContent } = extra;

    words.shift();
    // console.log(words, store.nbt);

    var iteratorVar = words.shift();
    var body = words.pop();
    body = body.replace("\r", "");
    body = store.nbt[body];
    words.shift();
    var arr = words.join(" ");
    arr = store.dataBlocks[arr];
    arr = arr.split("");
    arr.pop();
    arr.shift();
    arr = arr.join("");

    arr = arr.split(",");
    arr = arr.map(a => a.trim());

    // console.log(arr, body);

    var returnContent = [];

    arr.forEach(a => {
        returnContent.push(replaceAll(body, "$" + iteratorVar, a));
    });

    returnContent = returnContent.join("\n");
    returnContent = returnContent.split("\n");
    returnContent = runLines(returnContent);

    // console.log(returnContent);

    var content = returnContent.join("\n");

    var exportContent = {
        content: "",
        additionalFiles: []
    };

	// console.log("a", arr);
    arr.forEach(value => {
        var c = runBlocksOnContent(content, extra, "for", "v-" + replaceAll(value, " ", "_"), {
            arguments: [iteratorVar],
            body: body,
            values: [value]
        });

		console.log("c", c);

        // exportContent.content += "\n" + c.content;
        exportContent.additionalFiles = [...exportContent.additionalFiles, ...c.additionalFiles];
    });

    // console.log(exportContent);

    return {
        content: exportContent.content,
        additionalFiles: exportContent.additionalFiles
    }

}
