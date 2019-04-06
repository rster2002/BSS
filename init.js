const c = `module.exports = {

}`;


module.exports = {
	folders: [
		"dist",
		[
			"src",
			[
				"functions",
				"loot_tables",
				"recipies",
				"advancements",
				"tags"
			]
		]
	],
	files: [
		{
			path: "src/bss.config.js",
			content: c
		}
	]
}
