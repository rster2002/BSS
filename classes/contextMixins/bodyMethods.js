function bodyMethods(instance) {
    return {
        bodies: {},
        add(bodyContent) {
            var id = instance.id.scopedHash(bodyContent);
            this.bodies[id] = "b" + bodyContent;

            return id;
        },
        get(id) {
            return this.bodies[id];
        },
    }
}

module.exports = bodyMethods;