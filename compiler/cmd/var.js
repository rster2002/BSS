module.exports = function(words, config, extra) {
	words.shift();
	var scoreboard = words[0];
	var operation = words[1];
	var value = words[2];
	var {global, persist} = extra;
	var inFront = [];

	var {selector} = global;

	var c = ``;

	function registerScoreboard(scoreboard) {
		if (persist.scoreboards[scoreboard] === undefined) {
			inFront.push(`scoreboard objectives add ${scoreboard} dummy`);

			if (config.initScoreboard) {
				inFront.push(`scoreboard players add ${selector} ${scoreboard} 0`);
			}

			persist.scoreboards[scoreboard] = scoreboard;
		}
	}

	if (words.length === 1) {
		registerScoreboard(scoreboard);
	} else {
		if (!isNaN(value)) {
			if (operation === "=") {
				c = `scoreboard players set ${selector} ${scoreboard} ${value}`;
			} else if (operation === "+=") {
				c = `scoreboard players add ${selector} ${scoreboard} ${value}`;
			} else if (operation === "-=") {
				c = `scoreboard players remove ${selector} ${scoreboard} ${value}`;
			}

			registerScoreboard(scoreboard);
		} else {
			c = `scoreboard players operation ${selector} ${scoreboard} ${operation} ${selector} ${value}`;
		}
	}


	return {
		inFront,
		content: c,
		persist
	}
}
