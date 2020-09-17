module.exports = class InvalidValueError extends Error {
    constructor(command = "error", message) {
        super(`InvalidValue, ${command}: ${message}`);
    }
}