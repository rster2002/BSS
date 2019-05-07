var matchRecursive = function () {
	var	formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/,
		metaChar = /[-[\]{}()*+?.\\^$|,]/g,
		escape = function (str) {
			return str.replace(metaChar, "\\$&");
		};

	return function (str, format) {
		var p = formatParts.exec(format);
		if (!p) throw new Error("format must include start and end tokens separated by '...'");
		if (p[1] == p[2]) throw new Error("start and end format tokens cannot be identical");

		var	opener = p[1],
			closer = p[2],
			/* Use an optimized regex when opener and closer are one character each */
			iterator = new RegExp(format.length == 5 ? "["+escape(opener+closer)+"]" : escape(opener)+"|"+escape(closer), "g"),
			results = [],
			openTokens, matchStartIndex, match;

		do {
			openTokens = 0;
			while (match = iterator.exec(str)) {
				if (match[0] == opener) {
					if (!openTokens)
						matchStartIndex = iterator.lastIndex;
					openTokens++;
				} else if (openTokens) {
					openTokens--;
					if (!openTokens)
						results.push(str.slice(matchStartIndex, match.index));
				}
			}
		} while (openTokens && (iterator.lastIndex = matchStartIndex));

		return results;
	};
}();

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
