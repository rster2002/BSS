module.exports = function(words, config, extra) {
    words.shift();

    var objective = words.shift();
    var selector = words.shift();
    var prefix = words.shift();

    if (selector === undefined) {
        selector = "@s";
    }

    if (prefix === undefined) {
        prefix = "";
    } else {
        prefix = `{"text": "${prefix}: "},`;
    }

    return `tellraw @a [${prefix}{"score": {"objective": "${objective}", "name": "${selector}"}}]`
}
