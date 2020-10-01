const { EOL } = require("os");
const replaceAll = require("./replaceAll.js")

function removeUnused(string, character) {
    return string.split(character)
        .filter(item => item)
        .join(character);
}

function cleanup(string) {
    if (!string) return string;

    if (string.includes(EOL)) {
        return string.split(EOL)
            .map(line => cleanup(line))
            .filter(line => line)
            .join(EOL);
    }

    if (string.includes("\n")) {
        return string.split("\n")
            .map(line => cleanup(line))
            .filter(line => line)
            .join("\n");
    }

    string = replaceAll(string, "\t", "");
    string = removeUnused(string, "\n");
    string = removeUnused(string, EOL);
    string = removeUnused(string, " ");

    return string;
}

module.exports = {
    removeUnused,
    cleanup,
}