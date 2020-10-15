module.exports = function (args, context) {
    var dataChangeHandler = context.registerDataChangeHandler(context.continueHash);
    
    var dataSource;
    var store = "t" + dataChangeHandler;
    var scoreboard = "s" + dataChangeHandler;

    switch (args.length) {
        case 1:
            dataSource = `entity @s ${args[0]}`;
            break;

        case 2:
            dataSource = `entity ${args[0]} ${args[1]}`;
            break;

        default:
            dataSource = args.join(" ");
            break;
    }

    return `execute store success score Success ${scoreboard} run data modify storage ${store} Value set from ${dataSource}
    execute if score Success ${scoreboard} matches 1 <continue>
    data modify storage ${store} Value set from ${dataSource}`
}