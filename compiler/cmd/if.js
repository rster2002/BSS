// if i === 10 && j < 10

function clean(arr) {
	let r = [];
	arr.forEach(a => {
		if (a !== "") {
			r.push(a);
		}
	});

	return r;
}

function isNumber(a) {
	return !isNaN(a);
}

module.exports = function(words, config, extra) {

	var { global, genCmd, layer } = extra;

	layer++;

	var { selector } = global;

	words.shift();
	var cont;

	// start processing
	var operation = words.join(" ");

	if (operation.includes("&&") && operation.includes("||")) {
		throw new Error("Both \"&&\" and \"||\" are used inside one if statement");
	} else {

		// function for simple operators between a score and a static value
		function evalOperatorSimple(value1, value2, operator) {
			if (operator === "=" || operator === "==" || operator === "===") {
				return `${value1}=${value2}`;
			} else if (operator === ">") {
				return `${value1}=${Number(value2) + 1}..`;
			} else if (operator === ">=") {
				return `${value1}=${value2}..`;
			} else if (operator === "<") {
				return `${value1}=..${Number(value2) - 1}`;
			} else if (operator === "<=") {
				return `${value1}=..${value2}`;
			} else if (operator === "!=" || operator === "!==") {
				return `${value1}=..${Number(value2) - 1},${value1}=${Number(value2) + 1}..`
			}
		}

		// function for complex operations between two scores
		function evalOperatorComplex(value1, value2, operator) {
			if (operator === "==" || operator === "===") {operator = "="}
			if (operator === "!==" ) {operator = "!="}

			if (operator === "!=") {
				return `if score ${selector} ${value1} < ${selector} ${value2} if score ${selector} ${value1} > ${selector} ${value2}`
			} else {
				return `if score ${selector} ${value1} ${operator} ${selector} ${value2}`;
			}
		}

		// checks if the overal operation includes the following
		if (operation.includes("&&")) {

			// splits the operation into smaller operations
			var operations = operation.split(" && ");

			// vars for returning the content
			var complexOperations = "";
			var simpleOperations = [];

			// for every single operation
			for (var i = 0; i < operations.length; ++i) {
				let internalOperation = operations[i].split(" ");
				var value1 = internalOperation[0];
				var operator = internalOperation[1];
				var value2 = internalOperation[2];

				// checks whether it should use simple or complex
				if (value1.includes("global:") === false) {
					if (isNumber(value2)) {
						simpleOperations.push(`as ${selector}[scores={` + evalOperatorSimple(value1, value2, operator) + "}]");
					} else {
						complexOperations += " " + evalOperatorComplex(value1, value2, operator);
					}
				} else {
					let tempDedicatedTo = selector;
					selector = "global";
					value1 = value1.replace("global:", "");
					if (isNumber(value2)) {
						value3 = "n" + value2;
						defineScoreboard(value3);
						render(`scoreboard players set ${selector} ${value3} ${value2}`)
					} else {
						value3 = value2;
					}

					complexOperations += " " + evalOperatorComplex(value1, value3, operator);
					selector = tempDedicatedTo;
				}
			}

			// returnes the completed command
			return `execute ${simpleOperations.join(" ")}${complexOperations} ${genCmd(layer)}`
		} else if (operation.includes("||")) {

			// splits the operation into smaller operations
			var operations = operation.split(" || ");

			// var for returning content
			var returningIfStatement = "";
			for (var i = 0; i < operations.length; ++i) {
				let internalOperation = operations[i].split(" ");

				// gets the values and the operator
				var value1 = internalOperation[0];
				var operator = internalOperation[1];
				var value2 = internalOperation[2];

				// checks whether it should use simple or complex
				if (isNumber(value2)) {
					returningIfStatement += `execute as ${selector}[scores={${evalOperatorSimple(value1, value2, operator)}}] ${genCmd(layer)}\n`
				} else {
					returningIfStatement += `execute as ${selector} ${evalOperatorComplex(value1, value2, operator)} ${genCmd(layer)}\n`
				}
			}

			// returnes the completed command
			return returningIfStatement;
		} else {
			var value1 = words[0];
			var operator = words[1];
			var value2 = words[2];

			if (!value1.includes("global:")) {
				if (isNumber(value2)) {
					return  `execute as ${selector}[scores={${evalOperatorSimple(value1, value2, operator)}}] ${genCmd(layer)}`
				} else {
					return `execute as ${selector} ${evalOperatorComplex(value1, value2, operator)} ${genCmd(layer)}`
				}
			} else {
				let tempDedicatedTo = selector;
				selector = "global";
				value1 = value1.replace("global:", "");
				let value3;
				if (isNumber(value2)) {
					value3 = "n" + value2;
					defineScoreboard(value3);
					render(`scoreboard players set ${selector} ${value3} ${value2}`)
				} else {
					value3 = value2.replace("global:", "");
				}

				let r = `execute ${evalOperatorComplex(value1, value3, operator)}`
				selector = tempDedicatedTo;

				return r;
			}
		}
	}
}
