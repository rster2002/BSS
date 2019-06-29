var v = require("./cmd/var.js");
var i = require("./cmd/if.js");
var as = require("./cmd/as.js");
var operation = require("./cmd/operation.js");
var holding = require("./cmd/holding.js");
var store = require("./cmd/store.js");
var local = require("./cmd/local.js");
var call = require("./cmd/call.js");
var forCmd = require("./cmd/for.js");
var optimizedlist = require("./cmd/optimizedlist.js");
var log = require("./cmd/log.js");
var data = require("./cmd/data.js");
var compare = require("./cmd/compare.js");
var compiler = require("./cmd/compiler.js");

module.exports = {
	"var": v,
	"if": i,
	"as": as,
	"operation": operation,
	"store": store,
	"local": local,
	"call": call,
	"for": forCmd,
	"optimizedlist": optimizedlist,
	"log": log,
    "holding": holding,
    "data": data,
    "compare": compare,
    "compiler": compiler
}
