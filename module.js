module.exports = {
    name: "BSS",
    match: file => file.extension === "mcfunction",
    index: "./index.js",
    defaultConfig: {
        namespace: "minecraft",
        generatedFilePath: "./bss-generated",
        splitFunctionsIntoFiles: false,
        writeSetupFile: false,
    },
}