module.exports = function(words, config, extra) {
	words.shift();

    const numberPrefix = config.numberprefix;

    var {global, persist} = extra;
    var {selector} = global;

    var exportStep = 0;
    var exportList = [];
	var cleanupSteps = [];

    function genOperation(firstVal, operation, secondVal) {
        // Checks for numbers
        if (!isNaN(firstVal)) {
            exportList.push({
                type: "number",
                content: Number(firstVal)
            });

			cleanupSteps.push({
				type: "cleanup",
				content: Number(firstVal)
			});

            firstVal = numberPrefix + Number(firstVal);
        }

        if (!isNaN(secondVal)) {
            exportList.push({
                type: "number",
                content: Number(secondVal)
            });

			cleanupSteps.push({
				type: "cleanup",
				content: Number(secondVal)
			});

            secondVal = numberPrefix + Number(secondVal);
        }

        exportList.push({
            type: "operation",
            step: exportStep,
            content: `scoreboard players operation ${selector} ${firstVal} ${operation}= ${selector} ${secondVal}`
        });

        exportStep++;
    }

	var initialValue = words[0];

	if (!isNaN(initialValue)) {
		initialValue = numberPrefix + initialValue;
	}

    genOperation(initialValue, words[1], words[2]);
    words.shift();
    words.shift();
    words.shift();

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

	function clean(a) {
		return replaceAll(replaceAll(a, "\r", ""), "\n", "");
	}

    if (words.length > 0) {
		for (var i = 0; i < words.length; i += 2) {
			genOperation(initialValue, clean(words[i]), clean(words[i + 1]));
		}
	}

    var steps = [...exportList, ...cleanupSteps];
	var exportCmds = [];
	var numbers = {};

	steps.forEach(a => {
		if (a.type === "number") {
			if (numbers["a" + a.content] === undefined) {
				exportCmds.push(`scoreboard objectives add ${numberPrefix + a.content} dummy`);
				exportCmds.push(`scoreboard players set ${selector} ${numberPrefix + a.content} ${a.content}`);
			}
		} else if (a.type === "operation") {
			exportCmds.push(a.content);
		} else if (a.type === "cleanup" && config.cleanup === true) {
			exportCmds.push(`scoreboard objectives remove ${numberPrefix + a.content}`);
		}
	});

	return exportCmds.join("\n");
}
