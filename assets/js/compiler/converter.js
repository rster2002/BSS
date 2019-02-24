/*

MIT Licence

Copyright 2018-2019 Bjørn Reemer

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

const {genId} = require("./misc.js");
const updateBlock = require("./update_block.js");

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

function sel(ex, c) {
    var temp = matchRecursive(c, "@" + ex + "[...]");
    return temp.map(a => `@${ex}[${a}]`);
}

function isSelector(a) {
    return a === "@p" || a === "@a" || a === "@r" || a === "@s" || a === "@e";
}

function allSelectors(c) {
    if (typeof c !== "string") {
        c = c.join(" ");
    }
    var s = [];
    s = [...s, ...sel("p", c)];
    s = [...s, ...sel("a", c)];
    s = [...s, ...sel("r", c)];
    s = [...s, ...sel("s", c)];
    s = [...s, ...sel("e", c)];

    var i = c.split(" ");
    var r = [];
    var foundSelectors = {};

    i.forEach(a => {
        if (isSelector(a)) {
            var id = genId();
            r.push(id);
            foundSelectors[id] = {
                id,
                selector: a
            }
        } else {
            r.push(a);
        }
    });

    console.log(r);
    c = r.join(" ");

    s.forEach(a => {
        var id = genId();
        foundSelectors[id] = {
            id,
            selector: a
        }
        c = c.replace(a, id);
    });

    return {
        content: c,
        selectors: foundSelectors
    };
}

module.exports = {
    "1.12": function(content) {
        console.log("1.12", content);
        sls = allSelectors(content);

        content = sls.content;

        console.log(sls);

        const cmds = {

            // execute @s[name=hi, score_t_min=1] ~ ~ ~
            execute(words) {
                var selector = words[1];
                var pos = `${words[2]} ${words[3]} ${words[4]}`;
                words.shift();
                words.shift();
                words.shift();
                words.shift();
                words.shift();
                var cm = convertLine(words.join(" "));
                return `execute as ${selector} at @s positioned ${pos} run ${cm}`;
            },

			// blockdata <pos> <data>
			// data merge block <pos> <nbt>
			blockdata(words) {
				var pos = `${words[1]} ${words[2]} ${words[3]}`;
				words.shift();
				words.shift();
				words.shift();
				words.shift();
				var nbt = words.join(" ");
				return `data merge block ${pos} ${nbt}`
			},

			// clear <target> <item> <data> <count> <nbt>
			// clear <target> <item> <data> <nbt>
			// clear <target> <item> <count>
			clear(words) {
				var target = words[1];
				var item = updateBlock(words[2], words[3]);
				var count = words[4];
				words.shift();
				words.shift();
				words.shift();
				words.shift();
				words.shift();
				var nbt = "";
				console.log(words);

				if (count !== undefined) {
					t = words.join(" ");
					if (t !== undefined) {
						nbt = t;
					}
				} else {
					count = 1;
				}


				console.log(nbt);

				return `clear ${target} ${item}${nbt} ${count}`;
			},

			difficulty(words) {
				var i = {
					"0": "survival",
					"1": "creative",
					"2": "adventure",
					"3": "spectator",
					"survival": "survival",
					"creative": "creative",
					"adventure": "adventure",
					"spectator": "spectator"
				}

				return `difficulty ${i[words[1]]}`;
			}
        }

        function convertLine(line) {
            var words = line.split(" ");
            var cmd = words[0];
            if (cmds[cmd] !== undefined) {
                return cmds[cmd](words);
            } else {
                return words.join(" ");
            }
        }

        var lines = content.split("\n");
        var newLines = [];

        lines.forEach(a => {
            newLines.push(convertLine(a));
        });

        var newContent = newLines.join("\n");
        console.log(newContent);
        var entries = Object.entries(sls.selectors);
        console.log(entries);
        entries.forEach(a => {
            var id = a[0];
            var c = a[1];
            newContent = newContent.replace(id, c.selector);
        });

        return newContent;
    }
}
