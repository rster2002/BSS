function clean(arr) {
    var newArr = [];
    arr.forEach(a => {
        if (a !== "") {
            newArr.push(a);
        }
    });

    return newArr;
}

function cleanString(s) {
    s = s.split(" ");
    s = clean(s);
    return s.join(" ");
}

module.exports = function(words, config, extra) {
    words.shift();
    var { global, store } = extra;

    var key = words[0];
    words.shift();
    words.shift();

    if (words[0].includes("(") && words[words.length - 2].includes(")")) {
        var body = words.pop();
        var arguments = words.join(" ");

        arguments = arguments.replace("(", "").replace(")", "");
        arguments = arguments.split(",");

        arguments = arguments.map(a => cleanString(a));

        global.functions[key] = {
            arguments,
            body: store.nbt[body]
        }
    }

    var value = words.join(" ");

    global.local[key] = value;

    return {
        global
    };
}
