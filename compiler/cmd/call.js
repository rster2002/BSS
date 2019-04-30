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

    var { global, runLines, store, config } = extra;

    var temp = words[0].split("(");
    var name = temp[0];

    var fn = global.functions[name];

    words.shift();

    temp = [...temp, ...words];
    temp.shift();
    temp = temp.join(" ");
    temp = temp.replace(")", "");

    var arguments = temp.split(",");
    arguments = arguments.map(a => cleanString(a));
    var args = arguments;

    var body = fn.body;

    fn.arguments.forEach((a, i) => {
        body = replaceAll(body, "$" + a, args[i]);
    });

    var lines = body.split("\n");

    lines = runLines(lines);

    var content = lines.join("\n");
    var additionalFiles = [];

    var blocks = Object.entries(store.blocks);
    blocks.forEach(a => {
        var key = a[0];
        var body = a[1];
        // content = content.replace(, `<<${body}>>`);

        key = key.split("/");
        key.pop();
        key = key.join("/");

        if (content.includes(`function ${config.namespace}:${key}`)) {
            var i = args.map(a => replaceAll(a, " ", "_"));
            var newPath = `bss_functions/${name}/${key}/${name}-${config.argPrefix}-${i.join("-")}`;

            content = content.replace(`function ${config.namespace}:${key}`, `function ${config.namespace}:${newPath}`);

            fn.arguments.forEach((a, i) => {
                body = replaceAll(body, "$" + a, args[i]);
            });

            additionalFiles.push({
    			path: `${newPath}.mcfunction`,
    			content: body,
    			root: true
    		});
        }
    });

    return {
        content,
        additionalFiles
    };
}
