class Function {
	constructor(options) {
		this._output = "";
		if (options !== undefined) {
			if (options.file) {
				this._workingFile = options.file;
			}
			if (options.fileName) {
				this._workingFile = options.fileName + ".mcfunction";
			}
			if (options.dev) {
				this._dev = options.dev;
			}
		}
	}

	extend(renderProcess) {
		this.render(renderProcess, true);
	}

	render(renderProcess, extend) {
		var rtrn;
		var vars = {}, scoreboards = {};
		var renderFunctions = [];
		var rtrn, runContent, staticRunContent;
		if (extend) {
			rtrn = this._output;
		} else {
			rtrn = "";
		}

		// shortend text commands (used {{ }}) are defined here
		var shortendCommands = {
			var(words) {

				function ifScoreboard(scoreboard) {
					if (scoreboards[scoreboard] === undefined) {
						scoreboards[scoreboard] = true;
						return true;
					}
				}

				console.log("VAR")
				var scoreboard = words[1];
				var operation = words[2];
				var value = words[3];

				if (ifScoreboard(scoreboard)) {
					render("scoreboard objectives add " + scoreboard + " dummy");
				};
				if (isNumber(value)) {

					// if the value is a static number
					if (operation === "=") {
						return `scoreboard players set @s ` + scoreboard + ` ` + value;
					} else if (operation === "+=") {
						return `scoreboard players add @s ` + scoreboard + ` ` + value;
					} else if (operation === "-=") {
						return `scoreboard players remove @s ` + scoreboard + ` ` + value;
					}
				}
			},
			set(words, vars) {
				var defining = words[1];
				var operation = words[2];
				var value = isNumber(words[3]) ? Number(words[3]) : words[3];
				vars[defining] = value;
			}
		}

		// Object functions are defined here
		var functions = {
			repeat(entry, vars) {
				if (entry["props"]["min"] === undefined) {
					entry["props"]["min"] = 1;
				}
				if (entry["props"]["max"] === undefined) {
					entry["props"]["max"] = 2;
				}
				if (entry["props"]["range"] !== undefined) {
					let temp = entry["props"]["range"].split("-");
					entry["props"]["min"] = Number(temp[0]);
					entry["props"]["max"] = Number(temp[1]);
				}

				for (var i = entry["props"]["min"]; i <= entry["props"]["max"]; ++i) {
					vars.loop = i;
					runContent(entry["content"], vars);
				}
			},
			"player setup": function(entry, vars) {

				// gets the content defined inside the function
				var content = entry.content;

				// gets the content defined inside the function
				var content = entry.content;

				renderFunctions.unshift(function(content, vars) {
					function idFromString(line) {
						var arr = line.split("");
						var rid = 0;
						for (var i = 0; i < arr.length; ++i) {
							rid += arr[i].charCodeAt(0);
						}
						return rid;
					}
					return "execute as @a[tag=!" + idFromString(content) + "] at @s run " + content;
				})
				runContent(content, vars);

				renderFunctions.shift();
			}
		}

		// Just a basic function
		function isNumber(n) {
			return !isNaN(n);
		}

		// replaces all matches with a replacement
		function replaceAll(input, replace, replaced) {
			var rtrn = "";
			var r = input.split(replace);
			for (var i = 0; i < r.length; ++i) {
				if (i !== 0) {
					let p = replaced;
					rtrn += p;
				}

				if (input[i] !== "") {
					rtrn += r[i];
				}
			}

			if (rtrn === "") {
				rtrn = input;
			}
			return rtrn;
		}

		// This renders the content into the file.
		function render(content, vars) {

			var temp = replaceAll(content, "\t", "") + "\n";
			if (vars !== undefined) {
				var entries = Object.entries(vars);
				for (var i = 0; i < entries.length; ++i) {
					var variable = "$" + entries[i][0];
					var value = entries[i][1];
					temp = replaceAll(temp, variable, value);
				}
			}

			for (var i = 0; i < renderFunctions.length; ++i) {
				var fn = renderFunctions[i];
				temp = fn(temp, vars);
			}

			// Splits the text into lines
			var arr = temp.split("\n");
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var line = arr[i];
				var r = "";

				// Splits the line at every shortend command
				var broken = line.split("{{");
				console.log(broken);
				if (broken.length > 1) {
					let inFront = broken.shift();
					let rtrn = [];
					for (var p = 0; p < broken.length; ++p) {
						let ent = broken[p];
						ent = ent.split("}}");
						Object.assign(rtrn, ent);
						console.log(line, inFront, broken, ent, rtrn);
						if (ent.length > 1) {
							let words = ent[0].split(" ");
							if (words[0] === "") {
								words.shift();
							}

							if (shortendCommands[words[0]] !== undefined) {
								let returned = shortendCommands[words[0]](words, vars);
								if (returned !== undefined && returned !== "") {
									temp += inFront + returned + "\n";
								}
							}
						}
					}
				} else {
					if (broken[0] !== "") {
						temp += broken[0] + "\n";
					}
				}
				// if (line.includes("{{") && line.includes("}}")) {
				// 	var words = line.split(" ");
				//
				// 	for (var w = 0; w < words.length; ++w) {
				// 		if (words[w].includes("{{")) {
				//
				// 			// untill the shorted command starts, it skips over every words
				// 			// when it finds the beginning of the shortend command it stores
				// 			// everything in front to a var so there is a zero point
				// 			let inFront = words.splice(0, w);
				// 			if (words[0] === "{{") {
				// 				words.shift();
				// 			}
				//

				// 		}
				// 	}
				// } else {
				// 	temp += line + "\n";
				// }
			}

			rtrn += temp;
		}

		// Basic runContent function
		runContent = function(content, vars) {

			function runType(entry) {
				if (typeof entry === "object") {
					var functionType = entry.function;
					if (functions[functionType] !== undefined) {
						functions[functionType](entry, vars);
					}
				} else if (typeof entry === "function") {
					let returned = entry(vars);
					if (returned !== undefined) {
						runType(returned);
					}
				} else {
					render(entry, vars);
				}
			}

			if (typeof content === "object") {
				for (var i = 0; i < content.length; ++i) {
					var entry = content[i];
					runType(entry);
				}
			} else if (typeof content === "string") {
				render(content, vars);
			}
		}

		// sets a zero-point for run content function;
		staticRunContent = runContent;

		// checks if there is a render object defined, and if not, check if there is
		// an output defined.
		if (renderProcess !== undefined) {
			runContent(renderProcess["content"], vars);
		} else {
			if (this._output !== "") {
				return this._output;
			} else {
				console.error("First argument of render must be defined when not using .extend()");
			}
		}

		// Used for diffientiating between .extend and directly using .render
		if (extend === undefined || extend === false) {
			// if using .render directly
			if (this._dev === true) {
				console.log(rtrn);
			}
		} else {
			// if using .extende
			this._output = rtrn;
		}
	}
}
