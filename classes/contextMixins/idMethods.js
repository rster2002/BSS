function idMethods(instance) {
    return {
        scopedHash(content) {
            var namespace = instance.config.namespace;
            return instance.buildContext.tools.quickHash(namespace + content);
        },
    }
}

module.exports = idMethods;