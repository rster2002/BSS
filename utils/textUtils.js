const { EOL } = require("os");
const replaceAll = require("./replaceAll.js");

function removeUnused(string, character) {
    return string.split(character)
        .filter(item => item !== "")
        .join(character);
}

function cleanup(string) {
    string = removeUnused(string, EOL);
    string = removeUnused(string, " ");
    string = replaceAll(string, "\t", "");

    return string;
}

module.exports = {
    removeUnused,
    cleanup,
}