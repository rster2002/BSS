var v = require("./cmd/var.js");
var i = require("./cmd/if.js");
var as = require("./cmd/as.js");
var operation = require("./cmd/operation.js");
var holding = require("./cmd/holding.js");
var store = require("./cmd/store.js");
var local = require("./cmd/local.js");
var call = require("./cmd/call.js");

module.exports = {
	"var": v,
	"if": i,
	"as": as,
	"operation": operation,
	"store": store,
	"local": local,
	"call": call,
	"@holding": holding
}
