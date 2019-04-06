const cmds = require("./compiler/cmds.js");

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

function randomString(l) {
	let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var retn = "";
	for (var i = 0; i < l; i++) {
		var r = Math.floor(Math.random() * characters.length);
		retn += characters[r];
	}
	return retn;
}

function genId() {
	return randomString(32);
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

module.exports = function(a) {
	var {log, warn, content, config, persist} = a;
	var lines = [];
	var additionalFiles = [];
	var newContent = [];
	var inFront = [];
	var atBack = [];
	var store = {
		blocks: {},
		selectors: {}
	};
	var global = {
		selector: "@s"
	};

	// Sets up the persist store
	if (persist.scoreboards === undefined) {
		persist.scoreboards = {};
	}

	if (persist.blockCount === undefined) {
		persist.blockCount = 0;
		console.log("S");
	}

	// Defaults the config
	config = Object.assign({
		namespace: "null"
	}, config);

	// Function for clearing a file
	function clean(arr) {
		var newArr = [];
		arr.forEach(a => {
			if (a !== "") {
				newArr.push(a);
			}
		});

		return newArr;
	}

	var blocks = matchRecursive(content, "<<...>>");
	var blockCount = persist.blockCount;

	blocks.forEach(a => {
		let id = "b-" + blockCount;
		persist.blockCount++;
		content = content.replace(`<<${a}>>`, `function ${config.namespace}:bss_generated/${id}`);
		store.blocks[id] = a;

		additionalFiles.push({
			path: `./bss_generated/${id}.mcfunction`,
			content: a
		});
	});

	function s(a) {
		var selectors = matchRecursive(content, `@${a}[...]`);

		selectors.forEach(b => {
			var id = genId();
			content = content.replace(`@${a}[${b}]`, id);
			store.selectors[id] = `@${a}[${b}]`;
		});
	}

	s("p");
	s("a");
	s("r");
	s("s");
	s("e");

	// Removes tabs
	content = replaceAll(content, "\t", "");

	// Turns arrows into 'run'
	content = replaceAll(content, "=>", "run");

	lines = content.split("\n");

	// For every line
	lines.forEach(line => {

		var newLine = [];
		var context = {
			front: ""
		}

		// Finds every command
		var commands = line.split(" run ");
		var callTrace = 0;
		var newLine = true;

		function genCmd(layer) {
			var internalCmds = commands;
			callTrace += 1;
			internalCmds = internalCmds.slice(layer, Infinity);
			var a = internalCmds[0];

			if (a === undefined) {
				warn("Unexpected end: Expected a new command but instead got nothing");
				return "";
			} else {
				var internalLine = [];

				// Makes an array of words
				var words = clean(a.split(" "));

				// Checks if the word is a special command
				if (cmds[words[0]] !== undefined) {

					// Gets the output from the command
					let r = cmds[words[0]](words, config, {
						global,
						persist,
						genCmd,
						layer
					});

					if (typeof r === "string") {
						internalLine.push(r);
					} else if (typeof r === "object") {
						if (r.inFront !== undefined) {
							inFront = [...inFront, ...r.inFront];
						}
						if (r.atBack !== undefined) {
							atBack = [...atBack, ...r.atBack];
						}
						if (r.content !== undefined) {
							internalLine.push(r.content);
						}
						if (r.global !== undefined) {
							global = r.global;
						}
						if (r.additionalFiles !== undefined) {
							additionalFiles = [...additionalFiles, r.additionalFiles];
						}

						if (r.persist !== undefined) {
							persist = r.persist;
						}

						if (r.emit !== undefined) {
							var entr = Object.entries(r.emit);

							entr.forEach(em => {
								store = em(store);
							});
						}
					}
				} else {
					let c = commands;
					c = c.slice(layer, Infinity);
					internalLine.push(c.join(" run "));
				}

				if (layer === 0) {
					newLine = false;
					return internalLine[0];
				} else {
					return "run " + internalLine[0];
				}
			}
		}

		newContent.push(genCmd(0));
	});

	var exportContent = newContent.join("\n");

	if (inFront.length > 0) {
		exportContent = inFront.join("\n") + "\n" + exportContent;
	}

	if (atBack.length > 0) {
		exportContent = atBack.join("\n") + "\n" + exportContent;
	}

	// Recovers the selectors
	var selectorEntries = Object.entries(store.selectors);
	selectorEntries.forEach(a => {
		var id = a[0];
		var content = a[1];
		exportContent = replaceAll(exportContent, id, content);
	});

	function compress(a) {
		var lines = a.split("\n");
		var n = lines.map(a => {
			return replaceAll(a, "\r", "");
		}).filter(a => a !== "");

		return n;
	}

	console.log(compress(exportContent));

	return {
		content: exportContent,
		additionalFiles,
		persist
	};
}

// {
// 	path: "./bssGenerated/test.mcfunction",
// 	content: "# test"
// }
