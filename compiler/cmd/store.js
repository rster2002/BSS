const values = {
    time: {
        daytime: `execute store result score $selector $objective run time query daytime`
    }
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
    var storePos = words[0];
    var error = extra.error;
    // console.log(extra);

    var selector = extra.global.selector;

    var path = storePos.split(".");
    var val = values;

    if (path[0] === "self") {
        path.shift();
        let i = path.join();
        val = `execute store result score $selector $objective run data get entity @s ${i}`;
    } else {
        path.forEach(a => {
            val = val[a];
            if (val === undefined) {
                console.error("Can't find store path");
            }
        });
    }

    return replaceAll(replaceAll(val, "$selector", selector), "$objective", words[2])
}
