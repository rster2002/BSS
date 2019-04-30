module.exports = function(words, config, extra) {

    var { layer, genCmd } = extra;
    layer++;

    words.shift();

    if (words.length === 1) {
        return `execute as @s[nbt={SelectedItem:{id:"${words[0]}"}}] ${genCmd(layer)}`
    } else if (words.length === 2) {
        return `execute as @s[nbt={SelectedItem:{id:"${words[0]}",tag:${words[1]}}}] ${genCmd(layer)}`
    }
}
