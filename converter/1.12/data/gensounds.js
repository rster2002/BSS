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

fs.readFile(path.resolve(process.cwd(), "./soundsold.txt"), "utf8", (err, data) => {

    var exportJson = {};

    var lines = data.split("\n");

    lines.forEach(a => {

        var cols = a.split("\t");
        console.log(cols);

        exportJson[cols[0]] = replaceAll(cols[1], "\r", "");

    });

    fs.writeFile(path.resolve(process.cwd(), "./sounds.json"), beautify(exportJson, null, 4, 1), err => {
        console.log(err);
    });

});