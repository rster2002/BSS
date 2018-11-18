/*

MIT Licence

Copyright 2018 Bjørn Reemer

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const fs = require("fs");

var compilerVersion = "1.0.0";
var totalFiles;
var _ = require("lodash");
var workspaceDir;
var exportDir;
var totalFiles;
var completedFiles;
var callback = function() {}
var logging = false;
var logToConsole = function() {
	if (logging) {
		var args = arguments;
		for (var i = 0; i < args.length; ++i) {
			var arg = args[i];
			console.log(arg);
		}
	}
}
var traceToConsole = function() {
	if (logging) {
		var args = arguments;
		for (var i = 0; i < args.length; ++i) {
			var arg = args[i];
			console.trace(arg);
		}
	}
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

function readFileAndRender(file) {
	if (file !== undefined || !file.includes("\\.mcfunction")) {
		var url = workspaceDir + file;
		url = replaceAll(url, "%20", " ");
		let chars = [];
		for (var i = 0; i < url.length; ++i) {
			chars.push(url.charCodeAt(i));
		}
		url = buildStringFromCharcode(chars, {13: ""});
		logToConsole(url, chars.join("."));
		fs.readFile(url, "utf8", (err, data) => {
			if (err) {
				logToConsole(data);
				throw err;
			}
			let mc = new mcf({file: file});
			mc.render({
				content: data
			});
		});
	}
}

_reset = {
	use(files) {
		for (var i = 0; i < files.length; ++i) {
			var file = files[i];
			if (file.includes(".mcfunction")) {
				readFileAndRender(file);
			} else {
				if (!file.includes(".js")) {
					file = file + ".js";
				}

				let tempWorkspaceDir = replaceAll(workspaceDir, "%20", " ");

				fs.readFile(tempWorkspaceDir + file, "utf8", function(err, data) {
					if (err) {
						throw err;
					} else {
						eval(data);
					}
				});
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
	scoreboards: {}
}

renderer = _.cloneDeep(_reset);

class mcfunction {
	constructor(options) {
		let fileDefined, fileStockValue;
		if (options === undefined) {
			options = {};
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
		var rtrn;
		var dedicatedTo = "@s";
		var vars = {}, scoreboards = {};
		var renderFunctions = [];
		var preLine = [];
		var rtrn, runContent, staticRunContent;
		if (extend) {
			rtrn = this._output;
		} else {
			rtrn = "";
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
				let c = `scoreboard objectives add ${scoreboard} ${mode}`;
				if (renderer.setupFileC !== undefined) {
					let f = renderer.setupFileRef;
					f.extend({content: c});
				} else {
					render(c, vars);
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
							} else {
								if (operation === "=") {
									return `scoreboard players operation ${dedicatedTo} ${scoreboard} = ${dedicatedTo} ${value}`
								} else if (operation === "+=") {
									return `scoreboard players operation ${dedicatedTo} ${scoreboard} += ${dedicatedTo} ${value}`;
								} else if (operation === "-=") {
									return `scoreboard players operation ${dedicatedTo} ${scoreboard} -= ${dedicatedTo} ${value}`;
								}
							}
						}
					}
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

				logToConsole(words);

				function evaluateOperator(scoreboard, operator, value) {
					if (operator === "+" || operator === "-") {
						let i = operator + "=";
						let p = ["var", scoreboard, i, value];
						return shortendCommands.var(p);
					} else if (operator === "/" || operator === "*") {
						let i = operator + "=";
						if (isNumber(value)) {
							defineScoreboard(`n${value}`);
							render(`scoreboard players set ${dedicatedTo} n${value} ${value}`)
							return `scoreboard players operation ${dedicatedTo} ${scoreboard} ${i} ${dedicatedTo} n${value}`;
						}
					}
				}

				// [operation i = 10]
				var scoreboard = words[1];
				var operator = words[2];
				if (operator !== "=") {
					words.shift();
					if (words.length === 3) {
						var value = words[2];
						if (scoreboard !== undefined) {
							defineScoreboard(scoreboard);

							return evaluateOperator(scoreboard, operator, value);
						}
					} else if (words.length > 3) {
						var scoreboard = words[0];
						logToConsole(words);

						defineScoreboard(scoreboard);

						words.shift();

						logToConsole(words);

						var returning = "";
						for (var i = 0; i < words.length; i += 2) {
							var operator = words[i];
							var value = words[i + 1];
							returning += evaluateOperator(scoreboard, operator, value) + "\n";
						}

						return returning;
					}
				}
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
							if (isNumber(value2)) {
								simpleOperations.push(evalOperatorSimple(value1, value2, operator));
							} else {
								complexOperations += " " + evalOperatorComplex(value1, value2, operator);
							}
						}

						// returnes the completed command
						return `execute as ${dedicatedTo}[scores={${simpleOperations.join(",")}}]${complexOperations}${cont}`
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

						if (isNumber(value2)) {
							return  `execute as ${dedicatedTo}[scores={${evalOperatorSimple(value1, value2, operator)}}]${cont}`
						} else {
							return `execute as ${dedicatedTo} ${evalOperatorComplex(value1, value2, operator)}${cont}`
						}
					}
				}
			},
			every(words, vars, context) {
				words.pop();
				logToConsole("W", words);

				// gets the required values
				var interval = words[1];
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

				return `scoreboard players add ${dedicatedTo} ${scoreboard} 1\nexecute as ${dedicatedTo}[scores={${scoreboard}=${time}..}]${cont}${context.tail}\nexecute as ${dedicatedTo}[scores={${scoreboard}=${time}..}] run scoreboard players set @s ${scoreboard} 0`
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
						})
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
				if (!line.includes("#")) {
					rtrnArr.push(line);
				}
			}
			temp = rtrnArr.join("\n");

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

			// evaluates blocks
			contentInside("<<", ">>", function(chunk) {
				function idFromString(line) {
					var arr = line.split("");
					var rid = 0;
					for (var i = 0; i < arr.length; ++i) {
						rid += arr[i].charCodeAt(0);
					}
					return rid;
				}

				var chunkContentFile = new mcf({file: `bss_generated/${idFromString(chunk.content)}.mcfunction`});
				chunkContentFile.render({
					content: chunk.content
				});

				return `@#call@# ${vueApp.currentPrj.namespace}:bss_generated/${idFromString(chunk.content)}`
			});


			// evaluates commands
			contentInside("{{", "}}", function(chunk) {
				var broken = isolate(chunk.content.split(" "));

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

						logToConsole(path, broken);

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

			// adds the rendered line to the overal code
			return temp;
		}

		function render(content, vars) {
			logToConsole(content);
			let i = renderAndReturn(content, vars);
			logToConsole(i);
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

		function exportContent(content) {
			if (internalDev === true) {
				logToConsole(content);
				completeFile();
			} else {
				let url = exportDir + internalWorkingFile;
				url = url.split("%20").join(" ");
				let chars = [];
				for (var l = 0; l < url.length; ++l) {
					chars.push(url.charCodeAt(l));
				}
				url = buildStringFromCharcode(chars, {13: ""});
				logToConsole(url, chars.join("."));
				let dir = url;
				let p = dir.split("/");
				p.pop();
				let i = p.join("/") + "/";
				logToConsole(i);

				var arr = content.split("\n");
				content = "";
				var arrTemp = [];
				for (var l = 0; l < arr.length; ++l) {
					var line = arr[l];
					logToConsole(line);
					if (line !== "") {
						arrTemp.push(line);
					}
				}

				logToConsole(arr);

				content = arrTemp.join("\n");

				logToConsole(content, content.split("\n"));
				fs.mkdir(i, function() {
					fs.writeFile(url, content, function(err) {
						if (err) {
							logToConsole(err);
						} else {
							logToConsole("saved");
						}
					});
				});
				completeFile();
			}
		}

		logToConsole(rtrn);

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

class loottable {
	constructor(options) {
		if (options === undefined) {
			console.error("No config defined");
			return;
		}
		if (options.file === undefined) {
			console.error("No export file defined");
			return;
		}
		totalFiles += 1;
		this._dev = options.dev !== undefined ? options.dev : false;
		this._workingFile = options.file;
	}

	render(lootTable) {
		var returningEntries = [];
		var lastWeight = 1;
		var lastCalculatedWeight = 1;
		var internalExported = false;
		var internalDev = this._dev;
		var internalWorkingFile = this._workingFile;

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

		function runEntries(entries, collection) {
			var totalWeight = 0;
			for (var p = 0; p < entries.length; ++p) {
				totalWeight += entries[p]["weight"];
			}
			for (var p = 0; p < entries.length; ++p) {
				var entry = entries[p];
				entry.weight = entry.weight * lastWeight;
				logToConsole(entry);
				if (entry.type === "collection") {
					// var lastWeight = entry.weight;
					// var totalWeight = 0;
					// for (var p = 0; p < entry["entries"].length; ++p) {
					// 	totalWeight += entry["entries"][p];
					// }
					// logToConsole(totalWeight);
					lastCalculatedWeight = (entry.weight / totalWeight) * lastCalculatedWeight;
					logToConsole({
						entry: entry,
						totalWeight: totalWeight,
						lastCalculatedWeight: lastCalculatedWeight,
						calc: (entry.weight / totalWeight) * lastCalculatedWeight
					});
					runEntries(entry["entries"], true);
				} else {
					// let w = 0;
					// if (even) {
					// 	w = entries.length;
					// }
					// entry.weight *= 10000;
					logToConsole({
						entry: entry,
						totalWeight: totalWeight,
						lastCalculatedWeight: lastCalculatedWeight,
						calc: (entry.weight / totalWeight) * lastCalculatedWeight
					});

					if (collection) {
						entry.weight = (entry.weight / totalWeight) * lastCalculatedWeight;
					}
					entry.weight *= 10000;
					var i = String(entry.weight);
					logToConsole(entry.weight, i, i.split("."), i.split(".")[0], )
					entry.weight = Number(i.split(".")[0]);
					returningEntries.push(entry);
				}
			}
		}

		var pools = lootTable["pools"];
		var newPools = [];
		for (var i = 0; i < pools.length; ++i) {
			var pool = pools[i];
			runEntries(pool["entries"], false);
			pool.entries = returningEntries;
			newPools.push(pool);
		}

		function exportContent(content) {
			if (internalDev === true) {
				logToConsole(content);
				completeFile();
			} else {
				let url = exportDir + internalWorkingFile;
				url = url.split("%20").join(" ");
				let chars = [];
				for (var l = 0; l < url.length; ++l) {
					chars.push(url.charCodeAt(l));
				}
				url = buildStringFromCharcode(chars, {13: ""});
				logToConsole(url, chars.join("."));
				let dir = url;
				let p = dir.split("/");
				p.pop();
				let i = p.join("/") + "/";
				logToConsole(i);

				var arr = content.split("\n");
				content = "";
				var arrTemp = [];
				for (var l = 0; l < arr.length; ++l) {
					var line = arr[l];
					logToConsole(line);
					if (line !== "") {
						arrTemp.push(line);
					}
				}

				logToConsole(arr);

				content = arrTemp.join("\n");

				logToConsole(content, content.split("\n"));
				fs.mkdir(i, function() {
					fs.writeFile(url, content, function(err) {
						if (err) {
							logToConsole(err);
						} else {
							logToConsole("saved");
						}
					});
				});
				completeFile();
			}
		}

		lootTable.pools = newPools;
		exportContent(JSON.stringify(lootTable));
	}
}

// defines some shorthands
var mcf = mcfunction;
var lt = loottable;
var _r = renderer;

module.exports = {
	mcf: mcf,
	mcfunction: mcfunction,
	lt: lt,
	loottable: loottable,
	renderer: renderer,
	_r: _r,
	version: compilerVersion,
	compile: function(options, c) {

		completedFiles = 0;
		totalFiles = 0;

		callback = c;

		workspaceDir = options.workspaceDir;
		exportDir = options.exportDir;

		if (options.logging) {logging = true} else {logging = false}

		_r.use(["index.js"]);
	}
}
