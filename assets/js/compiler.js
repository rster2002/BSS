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
This software can't be claimed by anyone as their own property.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var totalFiles;

renderer = {
	use(files) {
		for (var i = 0; i < files.length; ++i) {
			var file = files[i];
			if (!file.includes(".js")) {
				file = file + ".js";
			}
			var url = vueApp.currentPrj.workspaceDir + file;
			var head  = document.getElementById('files');
			var link  = document.createElement('script');
			link.src = url;

			head.appendChild(link);
		}
	},
	file(f) {
		renderer.defaultFile = f;
	}
}

function compile() {
	vueApp.show = {
		build: false,
		projects: false,
		add: false
	}
	$("#files").remove();
	$("#loaded").append("<div id='files'></div>")
	$(".loader .bar .progress").css("width", "5%");
	$("#topTitle").text("Rendering...");
	totalFiles = 0;
	completedFiles = 0;
	renderer.use([
		"index.js"
	]);
}

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

		if (options !== undefined) {
			if (options.file !== undefined) {
				console.trace("DD");
				if (fileDefined) {
					options.file = fileStockValue;
				} else {
					if (renderer.defaultFile === "--relative") {
						let src = document.currentScript.src;
						console.log(src, renderer);
						let r = "file:///" + vueApp.currentPrj.workspaceDir;
						let file = src.replace(r, "").replace(".js", ".mcfunction");
						options.file = file;
						console.log("BB", options, file, vueApp.currentPrj.workspaceDir);
					} else if (renderer.defaultFile === "--root") {
						let src = document.currentScript.src;
						let i = src.replace("file:///" + vueApp.currentPrj.workspaceDir, "").split("/");
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
		console.log(options);
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
		var rtrn;
		var vars = {}, scoreboards = {};
		var renderFunctions = [];
		var rtrn, runContent, staticRunContent;
		if (extend) {
			rtrn = this._output;
		} else {
			rtrn = "";
		}

		function completeFile() {
			completedFiles += 1;
			let percentage = (completedFiles / totalFiles) * 100;
			console.log(completedFiles, totalFiles, percentage)
			$(".loader .bar .progress").css("width", percentage + "%");
			percentage = percentage > 100 ? 100 : percentage;
			if (percentage === 100) {
				vueApp.show = {
					build: true,
					projects: true,
					add: false
				}
				$("#topTitle").text("Done!");
			}
		}

		// shortend text commands (used {{ }}) are defined here
		var shortendCommands = {
			var(words) {

				function ifScoreboard(scoreboard) {
					if (scoreboards[scoreboard] === undefined) {
						scoreboards[scoreboard] = true;
					}
					return true;
				}

				console.log(words)
				var scoreboard = words[1];
				var operation = words[2];
				var value = words[3];

				if (operation !== "") {
					if (ifScoreboard(scoreboard)) {
						render("scoreboard objectives add " + scoreboard + " dummy");
					}
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
				} else {
					if (ifScoreboard(scoreboard)) {
						render("scoreboard objectives add " + scoreboard + " dummy");
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
					console.log("C", simulatedReturn);
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
						console.log({
							chunk: chunk,
							minValue: minValue,
							maxValue: maxValue
						})
					}
					console.log({
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
							console.log(data, p, returning, vars);
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
					// for (var i = 0; i < content.length; ++i) {
					// 	var contentEntry = content[i];
					// 	for (var o = 0; o < data.length; ++o) {
					// 		for (var i = 0; i < data.length; ++i) {
					// 			var ent = data[i];
					// 			vars[key] = ent;
					// 			console.log(contentEntry, ent, vars, key, data, list, i);
					// 			render(contentEntry, vars);
					// 		}
					// 	}
					// }
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
		function renderAndReturn(content, vars) {

			var temp = replaceAll(content, "\t", "") + "\n";
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
			}


			// Splits the text into lines
			var arr = temp.split("\n");
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var returningLine = "";
				var line = arr[i];
				var r = "";

				// Splits the line at every operation
				var broken = line.split("$(");
				console.log(broken);
				if (broken.length > 1) {
					let inFront = broken.shift();
					temp += inFront;
					let rtrn = [];
					for (var p = 0; p < broken.length; ++p) {
						let ent = broken[p];
						ent = ent.split(")");
						Object.assign(rtrn, ent);
						console.log("P", {
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

			// Splits the text into lines
			var arr = temp.split("\n");
			temp = "";
			for (var i = 0; i < arr.length; ++i) {
				var returningLine = "";
				var line = arr[i];
				var r = "";

				// Splits the line at every operation
				var broken = line.split("$[");
				console.log(broken);
				if (broken.length > 1) {
					let inFront = broken.shift();
					temp += inFront;
					let rtrn = [];
					for (var p = 0; p < broken.length; ++p) {
						let ent = broken[p];
						ent = ent.split("]");
						Object.assign(rtrn, ent);
						console.log("P", {
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

			// adds the rendered line to the overal code
			return temp;
		}

		function render(content, vars) {
			rtrn += renderAndReturn(content, vars);
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
				console.log(content);
				completeFile();
			} else {
				let url = vueApp.currentPrj.exportDir + internalWorkingFile;
				url = url.split("%20").join(" ");
				let dir = url;
				let p = dir.split("/");
				p.pop();
				let i = p.join("/") + "/";
				fs.mkdir(i, function() {
					fs.writeFile(url, content, function(err) {
						if (err) {
							console.log(err);
						} else {
							console.log("saved");
						}
					});
				});
				completeFile();
			}
		}

		// Used for diffientiating between .extend and directly using .render
		if (extend === undefined || extend === false) {
			// if using .render directly
			exportContent(rtrn);
		} else if (extend === "extend") {
			// if using .extend
			this._output = rtrn;
		} else if (extend === "extendAndRender") {
			this._output = rtrn;
			exportContent(this._output);
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
		this._dev = options.dev !== undefined ? options.dev : false;
		this._workingFile = options.file;
	}

	render(lootTable) {

		var returningEntries = [];
		var lastWeight = 1;
		var lastCalculatedWeight = 1;

		function runEntries(entries, collection) {
			var totalWeight = 0;
			for (var p = 0; p < entries.length; ++p) {
				totalWeight += entries[p]["weight"];
			}
			for (var p = 0; p < entries.length; ++p) {
				var entry = entries[p];
				entry.weight = entry.weight * lastWeight;
				console.log(entry);
				if (entry.type === "collection") {
					// var lastWeight = entry.weight;
					// var totalWeight = 0;
					// for (var p = 0; p < entry["entries"].length; ++p) {
					// 	totalWeight += entry["entries"][p];
					// }
					// console.log(totalWeight);
					lastCalculatedWeight = (entry.weight / totalWeight) * lastCalculatedWeight;
					console.log({
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
					console.log({
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
					console.log(entry.weight, i, i.split("."), i.split(".")[0], )
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

		lootTable.pools = newPools;
		if (!this._dev) {
			completeFile();
			let url = vueApp.currentPrj.exportDir + this._workingFile;
			let dir = url;
			let p = dir.split("/");
			p.pop()
			let i = p.join("/") + "/";
			fs.mkdir(i, function() {
				fs.writeFile(url, JSON.stringify(lootTable), function(err) {
					if (err) {
						console.log(err);
					} else {
						console.log("saved");
					}
				});
			});
		} else {
			completeFile();
			console.log(lootTable);
		}
	}
}

// defines some shorthands
const mcf = mcfunction;
const lt = mcfunction;
const _r = renderer;
