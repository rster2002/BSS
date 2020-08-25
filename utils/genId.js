function randomString(characters, l) {
    var returnString = "";

    for (var i = 0; i < l; i++) {
        var r = Math.floor(Math.random() * characters.length);
        returnString += characters[r];
    }

    return returnString;
}

module.exports = function genId(length = 9) {
    return randomString(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        length
    );
}