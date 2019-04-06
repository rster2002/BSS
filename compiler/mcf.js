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

Array.prototype.last = function() {
	return this[this.length - 1];
}

// replaces all matches with a replacement
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

function buildStringFromCharcode(arr, replace) {
	let returning = "";
	for (var i = 0; i < arr.length; ++i) {
		var code = arr[i];
		if (replace[code] !== undefined) {
			returning += replace[code];
		} else {
			returning += String.fromCharCode(code);
		}
	}
	logToConsole(arr, replace, returning);
	return returning;
}

_reset = {
	_data: {
		mcf: {
			search: {
				path: ""
			}
		}
	},
	use(files) {

		console.log(files);

		// Checks if the input is a string
		if (typeof files === "string") {
			files = [files];
		}

		for (var i = 0; i < files.length; ++i) {
			var file = files[i];
			if (typeof file === "string") {
				if (file.includes(".mcfunction") || file.includes(".mcf")) {
					console.log(file);
					readFileAndRender(file);
				} else {
					if (!file.includes(".js")) {
						file = file + ".js";
					}

					// var url = path.resolve(workspaceDir, file);
					// fs.readFile(url, "utf8", (err, data) => {
					// 	if (err) {throw new Error(err)}
					// 	eval(data);
					// });
				}
			}
		}
	},
	file(f) {
		renderer.defaultFile = f;
	},
	setupFile(f) {
		renderer.setupFileC = f;
		renderer.setupFileRef = new mcf({file: renderer.setupFileC});
	},
	scoreboards: {},
	template(name, a) {
		if (renderer.templates[name] === undefined) {
			let b = Object.assign({
				props: []
			}, a)
			renderer.templates[name] = b;
		} else {
			throw new Error(`Template ${name} has already been declared`);
		}
	},
	templates: {},
	mcf: {
		search: {
			path(template) {
				renderer._data.mcf.search.path = template;
			}
		}
	},
	uninstallFile(file) {
		renderer.uninstallFileC = file;
		renderer.uninstallFileRef = new mcf({file: renderer.uninstallFileC});
	}
}

var exact = [];

function evalPath(p) {
	if (p === undefined) {
		return;
	} else {
		if (renderer._data.mcf.search.path !== "") {
			return renderer._data.mcf.search.path(p);
		} else {
			return p;
		}
	}
}

// renderer = _.cloneDeep(_reset);
renderer = _reset;

class mcfunction {
	constructor(options) {
		let fileDefined, fileStockValue;
		if (options === undefined) {
			options = {};
		}

		if (typeof options === "string") {
			options = {file: options}
		}

		if (options.file !== undefined) {
			fileDefined = true;
			fileStockValue = options.file;
		} else {
			fileDefined = false;
		}

		if (renderer.defaultFile !== undefined && typeof renderer.defaultFile === "string" && options.file === undefined) {
			options.file = renderer.defaultFile;
		}
		totalFiles += 1;
		this._output = "";
		this._exported = false;

		if (options !== undefined) {
			if (options.file !== undefined) {
				traceToConsole("DD");
				if (fileDefined) {
					options.file = fileStockValue;
				} else {
					if (renderer.defaultFile === "--relative") {
						let src = document.currentScript.src;
						logToConsole(src, renderer);
						let r = "file:///" + workspaceDir;
						let file = src.replace(r, "").replace(".js", ".mcfunction");
						options.file = file;
						logToConsole("BB", options, file, workspaceDir);
					} else if (renderer.defaultFile === "--root") {
						let src = document.currentScript.src;
						let i = src.replace("file:///" + workspaceDir, "").split("/");
						let file = i[i.length - 1].replace(".js", ".mcfunction");
						options.file = file;
					} else {
						options.file = renderer.defaultFile;
					}
				}
			}
			this._workingFile = options.file;

			if (options.dev !== undefined) {
				this._dev = options.dev;
			} else {
				this._dev = false;
			}
		} else {
			this._dev = false;
			this._workingFile = "index.mcfunction";
		}
		logToConsole(options);
	}

	r(rendererProcess) {
		this.render(rendererProcess);
	}

	e(rendererProcess) {
		this.extendAndRender(rendererProcess);
	}

	ear(rendererProcess) {
		this.extendAndRender(rendererProcess);
	}

	extend(rendererProcess) {
		this.render(rendererProcess, "extendAndRender");
	}

	extendAndRender(rendererProcess) {
		this.render(rendererProcess, "extendAndRender");
	}

	render(renderProcess, extend) {
		var internalDev = this._dev;
		var internalWorkingFile = this._workingFile;
		var internalExported = this._exported;
		var rtrn = "";
		var dedicatedTo = "@s";
		var vars = {}, scoreboards = {};
		var renderFunctions = [];
		var preLine = [];
		var rtrn, runContent, staticRunContent;
		var postPend = [];
		var additionalFiles = [];
		// if (extend) {
		// 	log("Extending: '" + this._workingFile + "'");
		// 	rtrn = this._output;
		// } else {
		// 	log("Creating: '" + this._workingFile + "'");
		// 	rtrn = "";
		// }

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

		function useModule(module) {
			let m = bssModules[module];
			console.log("INSTALL MODULE", m);

			if (m.setup !== undefined) {
				let c = replaceAll(m.setup, "$_namespace", vueApp.currentPrj.namespace);
				render(c);
			}

			m.files.forEach(file => {
				let f = new mcf({file: evalPath("bss_modules/" + module + "/" + file.name)});

				let c = replaceAll(file.content, "$_namespace", vueApp.currentPrj.namespace);

				console.log(f, file);

				f.render({
					content: c
				});
			});
		}

		function completeFile() {
			if (internalExported === false) {
				completedFiles += 1;

				let percentage = (completedFiles / totalFiles) * 100;
				if (percentage > 100) {percentage = 100}

				callback({
					completedFiles: completedFiles,
					totalFiles: totalFiles,
					percentage: percentage
				});
			}
		}

		function defineScoreboard(scoreboard, mode) {
			if (mode === undefined) {
				mode = "dummy";
			}


			if (renderer.scoreboards[scoreboard] === undefined) {
				logToConsole("hellWOrld")
				renderer.scoreboards[scoreboard] = scoreboard;
				var c = `scoreboard objectives add ${scoreboard} ${mode}`;
				if (renderer.setupFileC !== undefined) {
					let f = renderer.setupFileRef;
					f.extend({content: c});
				} else {
					console.log("HELLO?" + c);
					render(c);
				}

				if (renderer.uninstallFileRef !== undefined) {
					let f = renderer.uninstallFileRef;
					f.extend({content: `scoreboard objectives remove ${scoreboard}`});
				}
			}
		}


		function scoreboardOperations(scoreboard, operation, value) {
			if (operation !== "" && operation !== undefined) {
				logToConsole("d", isNumber(value));

				if (isNumber(value)) {

					// if the value is a static number
					if (operation === "=") {
						return `scoreboard players set ${dedicatedTo} ${scoreboard} ${value}`
					} else if (operation === "+=") {
						return `scoreboard players add ${dedicatedTo} ${scoreboard} ${value}`;
					} else if (operation === "-=") {
						return `scoreboard players remove ${dedicatedTo} ${scoreboard} ${value}`;
					}
				} else {
					if (value === "time.daytime") {
						return `execute store result score ${dedicatedTo} ${scoreboard} run time query daytime`;
					} else if (value === "time.day") {
						return `execute store result score ${dedicatedTo} ${scoreboard} run time query day`;
					} else if (value === "time.gametime") {
						return `execute store result score ${dedicatedTo} ${scoreboard} run time query gametime`;
					} else if (value.includes("math.random(") && value.includes(")")) {
						useModule("random");

						let broken = value.split(",");
						let min = broken[0];
						min = Number(min.replace("math.random(", ""));

						let max = broken[1];
						max = Number(max.replace(")", ""));

						return `scoreboard players set ${dedicatedTo} bss_rmin ${min}
						scoreboard players set ${dedicatedTo} bss_rmax ${max + 1}
						@#call@# ${vueApp.currentPrj.namespace}:bss_modules/random/nextrandom
						scoreboard players operation ${dedicatedTo} ${scoreboard} = ${dedicatedTo} bss_rrandomvalue`

					} else {
						if (operation === "=") {
							return `scoreboard players operation ${dedicatedTo} ${scoreboard} = ${dedicatedTo} ${value}`
						} else if (operation === "+=") {
							return `scoreboard players operation ${dedicatedTo} ${scoreboard} += ${dedicatedTo} ${value}`;
						} else if (operation === "-=") {
							return `scoreboard players operation ${dedicatedTo} ${scoreboard} -= ${dedicatedTo} ${value}`;
						} else if (operation === "%=") {
							return `scoreboard players operation ${dedicatedTo} ${scoreboard} %= ${dedicatedTo} ${value}`;
						}
					}
				}
			}
		}



		// shortend text commands (used {{ }}) are defined here
		var shortendCommands = {
			var(words) {
				var scoreboard = words[1];
				var operation = words[2];
				var value = words[3];
				logToConsole("HELLOW", words, scoreboards, scoreboard, operation, value)

				if (scoreboard !== undefined) {

					if (operation === "as") {
						logToConsole("OPERATION AS");
						defineScoreboard(scoreboard, value);
					} else {
						defineScoreboard(scoreboard);
					}

					return scoreboardOperations(scoreboard, operation, value);
				}
			},
			"global": function(words) {

				var scoreboard = words[1];
				var operation = words[2];
				var value = words[3];

				if (scoreboard !== undefined && scoreboard !== "") {

					if (operation === "as") {
						defineScoreboard(scoreboard, value);
					} else {
						defineScoreboard(scoreboard);
					}

					let i = dedicatedTo;
					dedicatedTo = "global";
					let r = scoreboardOperations(scoreboard, operation, value);
					dedicatedTo = i;
					return r;

				}
			},
			let(words) {
				var scoreboard = words[1];
				var operation = words[2];
				var value = words[3];
				logToConsole("HELLOW", words, scoreboards, scoreboard, operation, value)

				if (scoreboard !== undefined) {

					function localDefine(scoreboard, mode) {
						if (mode === undefined) {
							mode = "dummy";
						}


						if (renderer.scoreboards[scoreboard] === undefined) {
							logToConsole("hellWOrld")
							renderer.scoreboards[scoreboard] = scoreboard;
							let c = `scoreboard objectives add ${scoreboard} ${mode}`;
							if (renderer.setupFileC !== undefined) {
								let f = renderer.setupFileRef;
								f.extend({content: c});
							} else {
								console.log("RENDERING SCOREBOARD")
								render(c, vars);
							}
						}

						postPend.push(`scoreboard objectives remove ${scoreboard}`);
					}

					function idFromString(line) {
						var arr = line.split("");
						var rid = 0;
						for (var i = 0; i < arr.length; ++i) {
							rid += arr[i].charCodeAt(0);
						}
						return rid;
					}

					let computedScoreboard = "let" + idFromString(scoreboard);

					if (operation === "as") {
						logToConsole("OPERATION AS");
						localDefine(computedScoreboard, value);
					} else {
						localDefine(computedScoreboard);
					}

					return scoreboardOperations(computedScoreboard, operation, value);
				}
			},
			set(words) {
				var defining = words[1];
				var operation = words[2];
				words.shift();
				words.shift();
				words.shift();
				logToConsole(words);
				var value;
				if (words.length > 1) {
					value = words.join(" ");
				} else {
					if (isNumber(words[0])) {
						value = Number(words[0]);
					} else {
						value = words[0];
					}
				}
				vars[defining] = value;
			},
			operation(words, vars) {

				words.shift();

				logToConsole(words);

				// [operation i + 10 / 2]
				// i + 10
				// i / 2

				var score = words[0];
				words.shift();
				var rtrn = [];

				for (var i = 0; i < words.length; ++i) {

					var operator = words[i];
					var value = words[i + 1];

					console.log(i, operator, value, "HEYHIHELLO")

					if (isNumber(value)) {

						let o;
						let mode;

						if (operator === "+") {
							o = "add";
							mode = "simple";
						} else if (operator === "-") {
							o = "remove";
							mode = "simple"
						} else if (operator === "*") {
							o = "*=";
							mode = "complex";
						} else if (operator === "/") {
							o = "/=";
							mode = "complex";
						} else if (operator === "%") {
							o = "%=";
							mode = "complex";
						}

						if (mode === "simple") {

							rtrn.push(`scoreboard players ${o} ${dedicatedTo} ${score} ${value}`);

						} else if (mode === "complex") {

							defineScoreboard("n" + value);

							rtrn.push(`scoreboard players set ${dedicatedTo} n${value} ${value}`);
							rtrn.push(`scoreboard players operation ${dedicatedTo} ${score} ${o} ${dedicatedTo} n${value}`);

						}


					} else if (!isNumber(value)) {

						let o;

						if (operator === "+") {
							o = "add";
						} else if (operator === "-") {
							o = "remove";
						} else if (operator === "*") {
							o = "*=";
						} else if (operator === "/") {
							o = "/=";
						} else if (operator === "%") {
							o = "%=";
						}

						rtrn.push(`scoreboard players operation ${dedicatedTo} ${score} ${o} ${dedicatedTo} ${value}`)

					}

					++i;

				}

				return "\n" + rtrn.join("\n") + "\n";
			},
			selector(words) {
				if (words[1] !== undefined) {
					dedicatedTo = words[1];
				}
			},
			line(words) {
				words.shift();
				logToConsole(words);
				preLine.push(words.join(" "));
			},
			escapeline(words) {
				preLine.pop();
			},
			call(words) {
				return `@#call@# ${words[1]}`;
			},
			if(words, vars, context) {
				words.shift();
				var cont;

				// checks if it is an arrow function
				logToConsole(words);
				if (words[words.length - 1] === "@#arrow@#") {
					cont = " run"
				} else {
					cont = "";
				}

				// start processing
				words.pop();
				var operation = words.join(" ");
				logToConsole(operation);
				if (operation.includes("&&") && operation.includes("||")) {
					thr("Both \"&&\" and \"||\" are used inside one if statement");
				} else {

					// function for simple operators between a score and a static value
					function evalOperatorSimple(value1, value2, operator) {
						if (operator === "=" || operator === "==" || operator === "===") {
							return `${value1}=${value2}`;
						} else if (operator === ">") {
							return `${value1}=${Number(value2) + 1}..`;
						} else if (operator === ">=") {
							return `${value1}=${value2}..`;
						} else if (operator === "<") {
							return `${value1}=..${Number(value2) - 1}`;
						} else if (operator === "<=") {
							return `${value1}=..${value2}`;
						} else if (operator === "!=" || operator === "!==") {
							return `${value1}=..${Number(value2) - 1},${value1}=${Number(value2) + 1}..`
						}
					}

					// function for complex operations between two scores
					function evalOperatorComplex(value1, value2, operator) {
						if (operator === "==" || operator === "===") {operator = "="}
						if (operator === "!==" ) {operator = "!="}

						if (operator === "!=") {
							return `if score ${dedicatedTo} ${value1} < ${dedicatedTo} ${value2} if score ${dedicatedTo} ${value1} > ${dedicatedTo} ${value2}`
						} else {
							return `if score ${dedicatedTo} ${value1} ${operator} ${dedicatedTo} ${value2}`;
						}
					}

					// checks if the overal operation includes the following
					if (operation.includes("&&")) {

						// splits the operation into smaller operations
						var operations = operation.split(" && ");

						// vars for returning the content
						var complexOperations = "";
						var simpleOperations = [];

						// for every single operation
						for (var i = 0; i < operations.length; ++i) {
							let internalOperation = operations[i].split(" ");
							var value1 = internalOperation[0];
							var operator = internalOperation[1];
							var value2 = internalOperation[2];

							// checks whether it should use simple or complex
							console.log("GLOBAL", value1, value1.includes("global:"))
							if (value1.includes("global:") === false) {
								if (isNumber(value2)) {
									simpleOperations.push(`as ${dedicatedTo}[scores={` + evalOperatorSimple(value1, value2, operator) + "}]");
								} else {
									complexOperations += " " + evalOperatorComplex(value1, value2, operator);
								}
							} else {
								let tempDedicatedTo = dedicatedTo;
								dedicatedTo = "global";
								value1 = value1.replace("global:", "");
								if (isNumber(value2)) {
									value3 = "n" + value2;
									defineScoreboard(value3);
									render(`scoreboard players set ${dedicatedTo} ${value3} ${value2}`)
								} else {
									value3 = value2;
								}

								complexOperations += " " + evalOperatorComplex(value1, value3, operator);
								dedicatedTo = tempDedicatedTo;
							}
						}

						// returnes the completed command
						return `execute ${simpleOperations.join(" ")}${complexOperations}${cont}`
					} else if (operation.includes("||")) {

						// splits the operation into smaller operations
						var operations = operation.split(" || ");

						// var for returning content
						var returningIfStatement = "";
						for (var i = 0; i < operations.length; ++i) {
							let internalOperation = operations[i].split(" ");

							// gets the values and the operator
							var value1 = internalOperation[0];
							var operator = internalOperation[1];
							var value2 = internalOperation[2];

							// checks whether it should use simple or complex
							logToConsole({
								value1: value1,
								operator: operator,
								value2: value2,
								isNub: isNumber(value2),
								chunk: context
							});
							if (isNumber(value2)) {
								returningIfStatement += `execute as ${dedicatedTo}[scores={${evalOperatorSimple(value1, value2, operator)}}]${cont}${context.tail}\n`
							} else {
								returningIfStatement += `execute as ${dedicatedTo} ${evalOperatorComplex(value1, value2, operator)}${cont}${context.tail}\n`
							}
						}

						// returnes the completed command
						return returningIfStatement;
					} else {
						var value1 = words[0];
						var operator = words[1];
						var value2 = words[2];

						logToConsole({
							value1: value1,
							operator: operator,
							value2: value2,
							isNub: isNumber(value2)
						});

						if (!value1.includes("global:")) {
							if (isNumber(value2)) {
								return  `execute as ${dedicatedTo}[scores={${evalOperatorSimple(value1, value2, operator)}}]${cont}`
							} else {
								return `execute as ${dedicatedTo} ${evalOperatorComplex(value1, value2, operator)}${cont}`
							}
						} else {
							let tempDedicatedTo = dedicatedTo;
							dedicatedTo = "global";
							value1 = value1.replace("global:", "");
							let value3;
							if (isNumber(value2)) {
								value3 = "n" + value2;
								defineScoreboard(value3);
								render(`scoreboard players set ${dedicatedTo} ${value3} ${value2}`)
							} else {
								value3 = value2.replace("global:", "");
							}

							let r = `execute ${evalOperatorComplex(value1, value3, operator)}${cont}`
							dedicatedTo = tempDedicatedTo;

							return r;
						}
					}
				}
			},
			every(words, vars, context) {
				words.shift();
				logToConsole("W", words);

				// gets the required values
				var interval = words[0];
				logToConsole(interval);
				var timeUnit = interval[interval.length - 1];
				logToConsole(timeUnit);
				interval = interval.split("");
				interval.pop();
				interval = interval.join("");
				var timeScaler = 0;
				var cont;


				if (isNumber(timeUnit)) {
					thr("No time unit specified");
				}

				console.log(timeUnit);

				// checks if it is an arrow function
				logToConsole(words);
				if (words[words.length - 1] === "@#arrow@#") {
					cont = " run"
				} else {
					cont = "";
				}

				if (timeUnit === "d") {
					// one in-game day
					timeScaler = 24000;
				} else if (timeUnit === "h") {
					// one in-game hour
					timeScaler = 1000;
				} else if (timeUnit === "s") {
					// one real-life second
					timeScaler = 20;
				} else if (timeUnit === "t") {
					// one in-game tick
					timeScaler = 1;
				} else if (timeUnit === "p") {
					// one real-life day
					timeScaler = 1728000;
				} else if (timeUnit === "o") {
					// one real-life hour
					timeScaler = 72000;
				} else if (timeUnit === "m") {
					// one real-life minute
					timeScaler = 1200;
				} else {
					thr("Unsupported time unit");
					return;
				}

				function idFromString(line) {
					var arr = line.split("");
					var rid = 0;
					for (var i = 0; i < arr.length; ++i) {
						rid += arr[i].charCodeAt(0);
					}
					return rid;
				}

				var scoreboard = idFromString(context.tail) + timeUnit;
				defineScoreboard(scoreboard);
				var time = Number(interval) * timeScaler;

				return `scoreboard players add ${dedicatedTo} ${scoreboard} 1\nexecute as ${dedicatedTo}[scores={${scoreboard}=${time}..}]${cont}${context.tail}\nexecute as ${dedicatedTo}[scores={${scoreboard}=${time}..}] run scoreboard players set @s ${scoreboard} 0\n`
			},
			template(words, vars, context) {

				words.shift();

				var template = words[0];

				if (renderer.templates[template] !== undefined) {

					var templateObj = renderer.templates[template];

					if (typeof templateObj.props === "object") {

						var props = templateObj.props;
						var content = templateObj.content;
						var localVars = {};

						words.shift();
						var args = words.join(" ");
						args = args.split(",");
						console.log(args);
						var defaults = {};

						if (Array.isArray(props) === false) {
							localVars = templateObj.props;
							let entries = Object.entries(props);
							props = [];

							console.log(entries, props);

							entries.forEach(prop => {
								if (typeof prop[1] === "string" || typeof prop[1] === "number") {
									defaults[prop[0]] = prop[1];
								} else {
									throw new Error(`Default value for prop: ${prop} was not a valid datatype`)
								}

							});
						}

						props.forEach(prop => {
							args.forEach(arg => {
								if (arg.includes(prop + "=")) {
									arg = arg.replace(prop + "=", "");
									if (arg[arg.length - 1] === " ") {
										arg = arg.split(" ")
										arg.pop()
										arg = arg.join(" ");
									}

									if (arg[0] === " ") {
										arg = arg.split(" ");
										arg.shift()
										arg = arg.join();
									}

									if (arg[0] === "\"") {
										arg = arg.split("\"")
										arg.shift();
										arg.pop();
										arg = arg[0];
									}

									localVars[prop] = arg;

									if (typeof content === "string") {
										content = replaceAll(content, "$" + prop, arg);
									}
								}
							});
						});

						if (typeof content === "function") {
							console.log(localVars);
							content = String(content(localVars));
						}

						let entries = Object.entries(defaults);

						console.log(defaults, entries);

						console.log(content);

						entries.forEach(prop => {
							content = replaceAll(content, "$" + prop[0], prop[1]);
						});

						return content;

					} else {
						return templateObj.content;
					}

				} else {
					throw new Error("Template not defined");
				}

			},
			as(words, vars, context) {
				words.shift();

				let cont;

				if (words.last() === "@#arrow@#") {
					cont = " run";
					words.pop();
				} else {
					cont = "";
				}

				let healed = words.join(" ");
				let selectors = healed.split(" && ");
				let rtrn = [];

				selectors.forEach(selector => {
					rtrn.push(`execute as ${selector}${cont}${context.tail}`);
				});

				return rtrn.join("\n");

			},
			"@mined": function(words, vars, context) {
				words.pop();

				let cont;
				let block = words[0];

				if (words.last() === "@#arror@#") {
					cont = " run";
					words.pop();
				} else {
					cont = "";
				}

				if (block === "" || block === undefined) {

				} else {
					defineScoreboard(`m${block}`, `minecraft.mined:minecraft.${block}`);
					return `execute as ${dedicatedTo} as @s[scores={m${block}=1..}]${cont}${context.tail}
					execute as ${dedicatedTo} as @s[scores={m${block}=1..}] run scoreboard players set @s m${block} 0`;
				}
			},
			"@damage": function(words, vars, context) {
				words.pop();

				let cont;
				if (words.last() === "@#arror@#") {
					cont = " run";
					words.pop();
				} else {
					cont = "";
				}

				defineScoreboard(`bDamage`, `minecraft.custom:minecraft.damage_taken`);
				return `execute as ${dedicatedTo} as @s[scores={bDamage=1..}]${cont}${context.tail}
				execute as ${dedicatedTo} as @s[scores={bDamage=1..}] run scoreboard players set @s bDamage 0`
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

				if (entry["props"]["optimize"] === false || entry["props"]["optimize"] === undefined) {
					for (var i = entry["props"]["min"]; i <= entry["props"]["max"]; ++i) {
						vars.loop = i;
						runContent(entry["content"], vars);
					}
				} else if (entry["props"]["optimize"] === true) {
					let simulatedReturn = "";
					for (var i = entry["props"]["min"]; i <= entry["props"]["max"]; ++i) {
						vars.loop = i;
						simulatedReturn += runContentAndReturn(entry["content"], vars);
					}
					logToConsole("C", simulatedReturn);
					let simulatedLines = simulatedReturn.split("\n");
					let totalLines = simulatedLines.length - 1; // z
					let totalChunks = Math.floor(Math.sqrt(totalLines)); // x
					let chunkSize = Math.floor(totalLines / totalChunks);
					let remainingChunk = totalLines % chunkSize;
					let chunks = [];
					while (simulatedLines.length >= chunkSize) {
						chunks.push(simulatedLines.splice(0, chunkSize));
					}
					if (simulatedLines.length > 0) {
						simulatedLines.pop();
						chunks.push(simulatedLines);
					}
					for (var i = 0; i < chunks.length; ++i) {
						function returnValue(line) {
							let p = line.split(entry["props"]["score"] + "=");
							p = p[1].split("}");
							return p[0];
						}
						let chunk = chunks[i];
						let minValue = returnValue(chunk[0]);
						let maxValue = returnValue(chunk[chunk.length - 1]);
						let returnThis = "scores={speed=" + minValue + ".." + maxValue + "}";
						let returnFull = entry["props"]["score"] + "/" + i;
						let returnLine = entry["props"]["template"];
						returnLine = returnLine.replace("$this", returnThis);
						returnLine = returnLine.replace("$full", returnFull);
						render(returnLine);
						let tempFile = new mcfunction({file: "/" + entry["props"]["score"] + "/" + i + ".mcfunction"});
						tempFile.render({
							content: chunk
						});
						logToConsole({
							chunk: chunk,
							minValue: minValue,
							maxValue: maxValue
						});
					}
					logToConsole({
						totalLines: totalLines,
						totalChunks: totalChunks,
						chunkSize: chunkSize,
						chunks: chunks
					});
				}
			},
			"for": function(entry, vars) {
				var content = entry.content;
				var props = entry.props;
				var expression = props["expression"].split(" in ");
				var key = expression[0];
				var list = expression[1];
				var data;
				if (vars[list] === undefined) {
					if (props[list] !== undefined) {
						data = props[list];
					} else {
						return false;
					}
				} else {
					data = vars[list];
				}
				if (typeof data === "object" && Array.isArray(data)) {
					vars._for = data;
					vars._key = key;
					renderFunctions.unshift(function(content, vars) {
						var data = vars._for;
						var key = vars._key;
						var temp = "";
						for (var p = 0; p < data.length; ++p) {
							var returning = data[p];
							vars[key] = returning;
							logToConsole(data, p, returning, vars);
							if (vars !== undefined) {
								var entries = Object.entries(vars);
								for (var i = 0; i < entries.length; ++i) {
									var variable = "$" + entries[i][0];
									var value = entries[i][1];
									if (isNumber(value)) {
										value = Number(value);
									}
									temp = replaceAll(content, variable, value);
								}
							}
						}
						return temp;
					});
					runContent(content, vars);
					vars[key] = undefined;
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
				});
				runContent(content, vars);

				renderFunctions.shift();
			}
		}

		// Just a basic function
		function isNumber(n) {
			return !isNaN(n);
		}

		// This renders the content into the file.
		function renderAndReturn(content, vars) {

			var temp = replaceAll(content, "\t", "") + "\n";
			function evaluateVars() {
				if (vars !== undefined) {
					var entries = Object.entries(vars);
					for (var i = 0; i < entries.length; ++i) {
						var variable = "$" + entries[i][0];
						var value = entries[i][1];
						if (isNumber(value)) {
							value = Number(value);
						}
						temp = replaceAll(temp, variable, value);
					}
				}
			}

			contentInside("<script>", "</script>", function(chunk) {
				var internalFn;
				eval("internalFn = function() {" + chunk.content + "}");

				var returned = internalFn(vars);

				if (returned) {
					return returned;
				}

			});

			evaluateVars();

			for (var i = 0; i < renderFunctions.length; ++i) {
				var fn = renderFunctions[i];
				temp = fn(temp, vars);
			}

			var arr = temp.split("\n");
			var rtrnArr = [];
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var line = arr[i]
				if (!line[0] !== "#") {
					rtrnArr.push(line);
				}
			}
			temp = rtrnArr.join("\n");


			// Wraps on-line shortend commands into {{  }}
			var arr = temp.split("\n");
			var rtrnArr = [];
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var line = arr[i]
				var words = line.split(" ");

				if (shortendCommands[words[0]] !== undefined) {
					rtrnArr.push(`{{ ${line} }}`);
				} else {
					rtrnArr.push(line);
				}
			}
			console.log(rtrnArr);
			temp = rtrnArr.join("\n");
			console.log(temp);

			// // Deletes #
			// var arr = temp.split("\n");
			// var rtrnArr = [];
			// temp = "";
			// for (var i = 0; i < arr.length; ++i) {
			// 	var line = arr[i];
			// 	console.log(line, line[0]);
			// 	if (line[0] !== "#") {
			// 		rtrnArr.push(line);
			// 	}
			// }
			// console.log(rtrnArr);
			// temp = rtrnArr.join("\n");
			// console.log(temp);

			let t = matchRecursive(temp, "<x>...</x>");
			console.log("EXACT", t, exact);

			t.forEach(x => {
				let id = genId();
				exact.push({
					id: id,
					content: x
				});
				console.log(exact);

				temp = temp.replace("<x>" + x + "</x>", id);
				console.log(temp);
			});


			function contentInside(start, end, callback) {
				var arr = temp.split(start);
				var returnChunk = arr.shift();
				logToConsole("A", arr);

				for (var i = 0; i < arr.length; ++i) {
					var chunk = arr[i];
					logToConsole(chunk);
					var chunkEnd = chunk.split(end);
					var content = chunkEnd[0];
					var chunkTail = chunkEnd[1];
					var c = {
						chunk: chunk,
						end: chunkEnd,
						content: content,
						tail: chunkTail
					}
					logToConsole("CHUNKS", c);

					var callbackReturned = callback(c);

					if (callbackReturned !== undefined && callbackReturned !== false) {
						if (callbackReturned.includes(c.tail)) {
							returnChunk += callbackReturned;
						} else {
							returnChunk += callbackReturned + `${c.tail}`;
						}
					} else {
						returnChunk += "";
					}
				}

				temp = returnChunk;

				evaluateVars();
			}

			function isolate(input) {
				// isolates the command
				if (input[input.length - 1] === "") {
					input.pop();
				}

				if (input[0] === "") {
					input.shift();
				}

				logToConsole(input);

				return input;
			}

			temp = replaceAll(temp, "=>", "@#arrow@#");

			let blocks = matchRecursive(temp, "<<...>>")

			console.log(temp, blocks);

			blocks.forEach(block => {
				function idFromString(line) {
					var arr = line.split("");
					var rid = 0;
					for (var i = 0; i < arr.length; ++i) {
						rid += arr[i].charCodeAt(0);
					}
					return rid;
				}

				let p = evalPath(`bss_generated/${idFromString(block)}.mcfunction`);

				var chunkContentFile = new mcf({file: p});

				chunkContentFile.render({
					content: block
				});

				temp = replaceAll(temp, "<<" + block + ">>", `@#call@# ${vueApp.currentPrj.namespace}:bss_generated/${idFromString(block)}`)

			});

			// evaluates blocks
			// contentInside("<<", ">>", function(chunk) {

			//

			//
				// return `@#call@# ${vueApp.currentPrj.namespace}:bss_generated/${idFromString(chunk.content)}`
			// });

			// evaluates commands
			contentInside("{{", "}}", function(chunk) {
				var broken = replaceAll(isolate(chunk.content), "\n", " ");
				broken = broken.split(" ");

				let b = [];
				broken.forEach(a => {
					if (a !== "") {
						b.push(a);
					}
				});

				broken = b;

				console.log(broken, b, broken[0], shortendCommands[broken[0]]);

				// checks if the keyword can be found
				var commandIndexed = shortendCommands[broken[0]];
				if (commandIndexed !== undefined) {


					var returnedValue = commandIndexed(broken, vars, chunk);
					if (returnedValue !== undefined && returnedValue !== false) {
						return returnedValue;
					} else {
						return "";
					}
				}
			});


			// // evaluates the operation blocks
			// contentInside("$(", ")", function(chunk) {
			// 	var broken = isolate(chunk.content.split(" "));
			// 	if (broken.length > 1) {
			// 		for (var i = 0; i < broken.length; ++i) {
			// 			if (isNumber(broken[i]) === false) {
			// 				thr("Only numbers may be used inside operation blocks");
			// 				return false;
			// 			}
			// 		}
			//
			// 		return eval(chunk.content);
			// 	}
			// });

			// Splits the text into lines
			var arr = temp.split("\n");
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var returningLine = "";
				var line = arr[i];

				if (line[0] !== "#") {
					var r = "";

					// Splits the line at every operation
					var broken = line.split("$(");
					logToConsole(broken);
					if (broken.length > 1) {
						let inFront = broken.shift();
						temp += inFront;
						let rtrn = [];
						for (var p = 0; p < broken.length; ++p) {
							let ent = broken[p];
							ent = ent.split(")");
							Object.assign(rtrn, ent);
							logToConsole("P", {
								line: line,
								inFront: inFront,
								broken: broken,
								ent: ent,
								rtrn: rtrn
							});

							if (ent.length > 1) {
								temp += eval(ent[0]) + ent[1];
							}
						}

						temp += "\n";
					} else {
						if (broken[0] !== "") {
							temp += broken[0] + "\n";
						}
					}
				}
			}

			// Splits the text into lines
			var arr = temp.split("\n");
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var returningLine = "";
				var line = arr[i];

				if (line[0] !== "#") {
					var r = "";

					// Splits the line at every operation
					var broken = line.split("$[");
					logToConsole(broken);
					if (broken.length > 1) {
						let inFront = broken.shift();
						temp += inFront;
						let rtrn = [];
						for (var p = 0; p < broken.length; ++p) {
							let ent = broken[p];
							ent = ent.split("]");
							Object.assign(rtrn, ent);
							logToConsole("P", {
								line: line,
								inFront: inFront,
								broken: broken,
								ent: ent,
								rtrn: rtrn
							});

							if (ent.length > 1) {
								temp += eval(ent[0]) + ent[1];
							}
						}

						temp += "\n";
					} else {
						if (broken[0] !== "") {
							temp += broken[0] + "\n";
						}
					}
				}
			}


			// for every line
			var arr = temp.split("\n");
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var line = arr[i];

				// if the line is a comment
				if (line[0] !== "#") {

					// finds every function call
					var broken = line.split("function");
					if (broken.length > 1) {
						let x = broken[1].split(":");
						broken.shift();
						broken.shift();
						let y = broken.length > 0 ? "function" : "";
						var path = x[1] + y + broken.join("function");

						console.log(path, broken);

						console.log(renderer._data.mcf.search.path, renderer._data.mcf.search.path("hey"))

						if (renderer._data.mcf.search.path !== "") {
							path = renderer._data.mcf.search.path(path);
							console.log(path);
						}

						// creates a path and if the path is not '' it runs it
						if (!path.includes("\\.mcfunction")) {
							let p = [];
							p.push(path + ".mcfunction");
							logToConsole(p, workspaceDir + path + ".mcfunction");
							_r.use(p);
						}
						// readFileAndRender(path + ".mcfunction");
					}
				}

				temp += line + "\n";
			}

			logToConsole(preLine);
			let l = temp.split("\n");
			let tempPreline = "";
			logToConsole(l);

			if (preLine.length > 0) {
				for (var i = 0; i < l.length; ++i) {
					logToConsole(l[i], );
					let c = l[i].charCodeAt(0);
					if (l[i] !== "" && l[i] !== " " && c !== 13) {
						tempPreline += preLine.join(" ") + " " + l[i] + "\n";
					}
				}
				temp = tempPreline;
			}

			evaluateVars();


			logToConsole(temp.split("@#call@#").join("function"));
			temp = temp.split("@#call@#").join("function");

			exact.forEach(x => {
				console.log("aaaaaaaa", x, temp.includes(x.content));
				temp = temp.replace(x.id, x.content);
			});

			temp = replaceAll(temp, "<x>", "");
			temp = replaceAll(temp, "</x>", "");

			// adds the rendered line to the overal code
			console.log("RTRN", rtrn, temp);
			return temp;
		}

		function render(content, vars) {
			traceToConsole(content);
			let i = renderAndReturn(content, vars);
			traceToConsole(i);
			rtrn += i;
		}

		// Basic runContent function
		function runContent(content, vars) {
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

		function runContentAndReturn(content, vars) {
			let tempRtrn = rtrn;
			rtrn = "";
			runContent(content, vars);
			let returning = rtrn;
			rtrn = tempRtrn;
			return returning;
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

		function cleanUp(content) {
			content = replaceAll(content, "\t", "");
			console.log(content);
			var lines = content.split("\n");
			console.log(lines);
			var newLines = [];

			lines.forEach(a => {
				console.log(a);
				if (a !== "" && a !== " " && a !== "\t") {
					newLines.push(a);
				}
			});

			console.log(newLines);
			return newLines.join("\n");

		}

		function exportContent(content) {

			console.log(content);

			var file = internalWorkingFile;
			var originalPath = internalWorkingFile;

			var temp = file.split(".");
			if (temp.last() === "mcf") {
				temp.pop();
				temp.push("mcfunction");
			} else if (temp.last() === "bss") {
				temp.pop();
				temp.push("mcfunction");
			}

			console.log(file, temp);

			file = temp.join(".");

			var url = path.resolve(exportDir, functionOutputPath);
			url = path.resolve(url, file);
			var folderPath = url.split(path.sep);
			folderPath.pop();
			folderPath = folderPath.join("\\");

			if (postPend.length > 0) {
				content = content + "\n" + postPend.join("\n");
			}

			if (parsers.length > 0) {
				parsers.forEach(p => {

					if (p.name !== undefined) {
						log(`Parsing '${originalPath}' through: '${p.name}'`);
					}

					function v() {
						var r = p.method(content, pkg);
						if (r !== undefined) {
							content = r;
						}
					}

					if (p.filter !== undefined) {
						var r = p.filter({source: originalPath, exportLocation: file});
						console.log(r);
						if (r !== undefined) {
							if (r === true) {
								v();
							}
						}
					} else {
						v();
					}
				});
			}

			content = cleanUp(content);


			if (internalDev === true) {
				logToConsole(content);
				completeFile();
			} else {
				//
				// shelljs.mkdir("-p", folderPath);
				// fs.writeFile(url, content, function(err) {
				// 	if (err) {
				// 		logToConsole(err);
				// 	} else {
				// 		logToConsole("saved to path: " + url);
				// 	}
				// });
				//
				// completeFile();
			}
		}

		console.log(rtrn);

		// Used for diffientiating between .extend and directly using .render
		if (extend === undefined || extend === false) {
			// if using .render directly
			exportContent(rtrn);
			this._exported = true;
		} else if (extend === "extend") {
			// if using .extend
			this._output = rtrn;
			this._exported = true;
		} else if (extend === "extendAndRender") {
			this._output = rtrn;
			exportContent(this._output);
			this._exported = true;
		}
	}
}

module.exports = mcfunction;
