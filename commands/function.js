module.exports = function(args, context) {
    const { config, buildContext } = context;
    const [callLocation] = args;

    if (callLocation.includes(config.namespace + ":")) {
        let fileLocation = callLocation.replace(config.namespace + ":", "");

        if (fileLocation.includes(".js")) {
            let moduleResponse = buildContext.files.readModuleFromSourceDir("./" + fileLocation);

            return moduleResponse;
        } else {
            buildContext.input.buildSync(`./${fileLocation}.mcfunction`);
        }
    }

    return `function ${args.join(" ")}`;
}