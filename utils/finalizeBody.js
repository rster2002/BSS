const { inflateBodies } = require("./bodyUtils.js");

module.exports = function finalizeBody(body, context) {
    body = inflateBodies(body, context);

    return body;
}