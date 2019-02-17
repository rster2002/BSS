module.exports = {
    genId() {
        function randomString(l) {
            let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            var retn = "";
            for (var i = 0; i < l; i++) {
                var r = Math.floor(Math.random() * characters.length);
                retn += characters[r];
            }
            return retn;
        }
        return randomString(32);
    }
}
