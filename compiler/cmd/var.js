module.exports = function(words, config, extra) {
	var scoreboard = words[1];
	var operation = words[2];
	var value = words[3];
	var {global, persist} = extra;
	var inFront = [];

	var {selector} = global;

	var c = ``;

	if (!isNaN(value)) {
		if (operation === "=") {
			c = `scoreboard players set ${selector} ${scoreboard} ${value}`;
		} else if (operation === "+=") {
			c = `scoreboard players add ${selector} ${scoreboard} ${value}`;
		} else if (operation === "-=") {
			c = `scoreboard players remove ${selector} ${scoreboard} ${value}`;
		}

		if (persist.scoreboards[scoreboard] === undefined) {
			inFront.push(`scoreboard objectives add ${scoreboard} dummy`);
			persist.scoreboards[scoreboard] = scoreboard;
		}
	} else {
		c = `scoreboard players operation ${selector} ${scoreboard} ${operation} ${selector} ${value}`;
	}

	return {
		inFront,
		content: c,
		persist
	}
}
