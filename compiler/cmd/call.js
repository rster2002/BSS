const path = require("path");

function clean(arr) {
    var newArr = [];
    arr.forEach(a => {
        if (a !== "") {
            newArr.push(a);
        }
    });

    return newArr;
}

function cleanString(s) {
    s = s.split(" ");
    s = clean(s);
    return s.join(" ");
}

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
    words.shift();

    var { global, runLines, runBlocksOnContent, store, config, matchNbt } = extra;

    var temp = words[0].split("(");
    var name = temp[0];

    var fn = global.functions[name];

    words.shift();

    temp = [...temp, ...words];
    temp.shift();
    temp = temp.join(" ");
    temp = temp.replace(")", "");

    var arguments = temp.split(",");
    arguments = arguments.map(a => a.trim());
    var args = arguments;


    var body = fn.body;

    fn.arguments.forEach((a, i) => {
        body = replaceAll(body, "$" + a, args[i]);
    });

    let tempMatch = matchNbt(body, store);
    body = tempMatch.content;
    store = tempMatch.store;
    console.log("s", store);
    console.log("b", body);

    var lines = body.split("\n");

    lines = runLines(lines);

    var content = lines.join("\n");
    var additionalFiles = [];

    var i = args.map(a => replaceAll(a, " ", "_"));
    content = runBlocksOnContent(content, extra, "function", i.join("-"), {...fn, values: args});

    return {
        content: content.content,
        additionalFiles: content.additionalFiles,
        store
    };
}
