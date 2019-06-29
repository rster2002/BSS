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

module.exports = function (words, config, extra) {
    words.shift();

    var operation = words.shift();
    
    if (operation === "define") {

        let type = words.shift();

        // console.log(type);

        if (type === "local" || type === "global") {
            var { global, persist, store } = extra;

            var tempStore;
            var key = words[0];
            words.shift();
            words.shift();

            if (type === "local") {
                tempStore = global;
            } else if (type === "global") {
                tempStore = persist;
            }

            if (words[0].includes("(") && words[words.length - 2].includes(")")) {
                var body = words.pop();
                var arguments = words.join(" ");

                body = body.replace("\r", "");

                arguments = arguments.replace("(", "").replace(")", "");
                arguments = arguments.split(",");

                arguments = arguments.map(a => cleanString(a));

                tempStore.functions[key] = {
                    arguments,
                    body: store.nbt[body]
                }
            } else {
                var value = words.join(" ");
                tempStore.local[key] = value;
            }

            if (type === "local") {
                return {
                    global: tempStore
                }
            } else if (type === "global") {
                return {
                    persist: tempStore
                }
            }
        }

    }
    
}