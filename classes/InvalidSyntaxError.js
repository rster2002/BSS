module.exports = class InvalidSyntaxError extends Error {
    constructor(command = "error", message) {
        super(`InvalidSyntax, ${command}: ${message}`);
    }
}