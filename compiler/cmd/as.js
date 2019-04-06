function clean(arr) {
	let r = [];
	arr.forEach(a => {
		if (a !== "") {
			r.push(a);
		}
	});

	return r;
}

function cleanStr(a) {
	let i = clean(a.split(" "));
	return i.join(" ");
}

module.exports = function(words, config, extra) {

	var { global, genCmd, layer } = extra;

	layer++;

	words.shift();

	var out = [];
	var healed = words.join(" ");

	var selectors = healed.split("||");

	selectors.forEach(a => {
		let s = cleanStr(a);
		out.push(`execute as ${s} at @s ${genCmd(layer)}`);
	});

	return out.join("\n");

}
