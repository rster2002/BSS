function selectorMethods(instance) {
    return {
        selectors: {},
        isRegisteredSelector(id) {
            return this.selectors[id] !== undefined;
        },
        add(selectorContent) {
            var id = instance.id.scopedHash(selectorContent);
            this.selectors[id] = "s" + selectorContent;

            return id;
        },
        get(id) {
            return this.selectors[id];
        },
    }
}

module.exports = selectorMethods;