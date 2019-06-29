const fs = require("fs");
const path = require("path");
const beautify = require("json-beautify");

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

fs.readFile(path.resolve(process.cwd(), "./wiki.txt"), "utf8", (err, data) => {

    var exportJson = {};

    var lines = data.split("\n");
    var oldBlock = "";
    var nr = 0;

    lines.forEach(a => {

        if (a[0] === " ") {
            var words = a.split("\t");
            nr++;
            exportJson[oldBlock][nr] = replaceAll(words[1], "\r", "");
        } else {
            var words = a.split("\t");
            console.log(words[2], words[4]);
            oldBlock = words[2];
            nr = 0;
            exportJson[words[2]] = {
                0: replaceAll(words[4], "\r", "")
            }
        }

    });

    fs.writeFile(path.resolve(process.cwd(), "./blocks.json"), beautify(exportJson, null, 4, 1), err => {
        console.log(err);
    });

});