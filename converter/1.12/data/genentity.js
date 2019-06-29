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

fs.readFile(path.resolve(process.cwd(), "./entityold.txt"), "utf8", (err, data) => {

    var exportJson = {};

    var lines = data.split("\n");

    lines.forEach(a => {

        var cols = a.split("\t");
        console.log(cols);

        exportJson[cols[1]] = replaceAll(cols[2], "\r", "");

    });

    fs.writeFile(path.resolve(process.cwd(), "./entities.json"), beautify(exportJson, null, 4, 1), err => {
        console.log(err);
    });

});