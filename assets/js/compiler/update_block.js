module.exports = function(block, data) {
    var b = {
        "grass": {
        	0: "grass_block"
        },
        "planks": {
            0: "oak_planks",
            1: "spruce_planks",
            2: "birch_planks",
            3: "jungle_planks",
            4: "acacia_planks",
            5: "dark_oak_planks"
        },
        "log": {
            0: "oak_log",
            1: "spruce_log",
            2: "birch_log",
            3: "jungle_log",
            4: "acacia_log",
            5: "dark_oak_log"
        },
        "leaves": {
            0: "oak_leaves",
            1: "spruce_leaves",
            2: "birch_leaves",
            3: "jungle_leaves",
            4: "acacia_leaves",
            5: "dark_oak_leaves"
        }
    }

	console.log(block, data, b[block][Number(data)]);
	return b[block][Number(data)];
}
