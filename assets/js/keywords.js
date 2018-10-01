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

var fileId = 0;

keywords = {
	"#": function() {

	},
	player: function() {
		fileId += 1;
		if (compiler.line[1] === "setup") {
			compiler.workOnFile('loop');
			compiler.setSavedSelector('@s');
			compiler.setExportFunction((line) => {
				var arr = line.split("");
				var rid = 0;
				for (var i = 0; i < arr.length; ++i) {
					rid += arr[i].charCodeAt(0);
				}

				compiler.addAsIs.after = [
					"tag @a[tag=!" + rid + "] add " + rid
				]
				return "execute as @a[tag=!" + rid + "] at @a run " + line;
			});
			compiler.onExit(false);
		}
	},
	var: function() {
		var shift = 0;
		if (compiler.savedSelector !== false && isSelector(compiler.line[1]) === false) {
			compiler.line = insertAt(compiler.line, 1, compiler.savedSelector);
		} else {
			shift = 1;
		}
		// var @s timer = 10
		// var timer stat
		var selector = compiler.line[1 - shift];
		var score = compiler.line[2 - shift];
		var operator = compiler.line[3 - shift];
		var value = compiler.line[4 - shift];
		if (operator !== "=") {
			// it only creates the scoreboard
			if (operator === undefined) {
				compiler.addScoreboard(score, 'dummy');
			} else {
				compiler.addScoreboard(score, operator);
			}
		} else {
			compiler.addScoreboard(score, 'dummy');
			return 'scoreboard players set ' + selector + ' ' + score + ' ' + value;
		}
 	},
	score: function() {
		return keywords.var();
	},
	template: function() {
		console.log("TEMPLATE")
		// template name ( var1 var2 ) {
		// 	say <var1>
		// 	say <var2>
		// }
		var templateName = compiler.line[1];
		var props = [];
		var i = 3;
		while(compiler.line[i].includes(")") === false) {
			console.log(i, compiler.line[i], compiler.line[i].includes(")"))
			var prop = compiler.line[i];
			props.push(prop);
			++i;
		}

		compiler.templates[templateName] = {
			name: templateName,
			props: props,
			lines: []
		}

		compiler.currentTemplateBuilding = templateName;

		compiler.workOnFile(false);
		compiler.setSavedSelector(false);
		compiler.setExportFunction(function(line) {
			console.log("I");
			compiler.templates[compiler.currentTemplateBuilding].lines.push(line);
		});
		compiler.onExit(false);

		keywords[templateName] = function() {
			console.log("CALLED");
			return keywords.recall();
		}
	},
	recall: function() {
		var shift = 0;
		var propObj = {};
		if (compiler.line[0] === 'recall') {
			shift = 1;
		}

		var templateName = compiler.line[0 + shift];
		var templateObj = compiler.templates[templateName];
		var destroyedLines = [];
		console.log(templateName, templateObj);

		for (var i = 0; i < templateObj.props.length; ++i) {
			var propName = templateObj.props[i];
			var value = compiler.line[i + shift + 2];
			propObj[propName] = value;
		}

		for (var i = 0; i < templateObj.lines.length; ++i) {
			var tempLine = templateObj.lines[i];
			for (var p = 0; p < templateObj.props.length; ++p) {
				var prop = templateObj.props[p];
				var tempLine = replaceExplit(tempLine, "<" + prop + ">", propObj[prop]);
			}
			var temp = destroy(tempLine);
			destroyedLines.push(temp);
			console.log(temp, destroyedLines);
		}
		// test ( hello )

		compiler.compilerLines = insertAll(compiler.compilerLines, compiler.currentIndex + 1, destroyedLines);
	},
	link: function() {
		// link player
		// link player as standalone

		if (compiler.line[2] === "as") {

		}
	},
	compile: function() {
		// compile as standalone named index
		if (compiler.line[1].includes(".bss") && compiler.line[2] === "as" && compiler.line[3].includes(".mcfunction")) {
			let lastChar = compiler.prj.workspaceDir[compiler.prj.workspaceDir.length - 1];
			let modLastChar = compiler.line[3][compiler.line[3].length - 1];
			let modified;

			if (modLastChar === "/") {
				modified = compiler.line[3][compiler.line[3].length - 1] === "";
			} else {
				modified = compiler.line[3];
			}


			if (lastChar === "/") {
				get = compiler.prj.workspaceDir + modified;
			} else {
				get = compiler.indexPath + "/" + modified;
			}
		}
		// if (compiler.line[1] === "as") {
		// 	if (compiler.line[2] === "standalone" || compiler.line[2] === "self" || compiler.line[2] === "is") {
		// 		if (compiler.line[3] === "named") {
		// 			compiler.workOnFile(compiler.line[4]);
		// 		}
		// 	}
		// }
	},
	repeat: function() {

		// repeat 1-10
		if (compiler.line[1].includes("-")) {
			compiler.repeatLines = [];

			compiler.setExportFunction(function(line) {
				compiler.repeatLines.push(line);
			});

			compiler.onExit(function() {
				compiler.compilerLines = insertAll(compiler.compilerLines, compiler.currentIndex + 1, compiler.repeatLines);
				compiler.repeatLines = [];
			});
		}
	}
}
