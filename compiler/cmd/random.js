module.exports = function(words, config, extra) {
    words.shift();

    var range = words[0];
    range = range.split("-");
    var min = range[0];
    var max = range[1];

    var scoreboard = words[2];

    var additionalFiles = [
        {
            path: "./bss_modules/random/setup.mcfunction",
            root: true,
            content: `
            function ${config.namespace}:bss_modules/random/scoreboards
            if bss_rseeddefined = 0 run <<
                execute store result score @s bss_rseed run data get entity @r Pos[0]
                scoreboard objectives add con-1 dummy
                scoreboard players set @s con-1 -1
                execute if score @s bss_rseed matches ..0 run scoreboard players operation @s bss_rseed *= @s con-1
                operation bss_rseed % bss_rm
                var bss_rrandom = bss_rseed
                var bss_rseeddefined = 1
            >>
            tag @s add bss_rsetup
            #`
        },
        {
            root: true,
            path: "./bss_modules/random/scoreboards.mcfunction",
            content: `scoreboard objectives add bss_rseed dummy
            scoreboard objectives add bss_rrandom dummy
            scoreboard objectives add bss_rm dummy
            scoreboard objectives add bss_ra dummy
            scoreboard objectives add bss_rc dummy
            scoreboard objectives add bss_rtemp dummy
            scoreboard objectives add bss_rvalue dummy
            scoreboard objectives add bss_rmax dummy
            scoreboard objectives add bss_rmin dummy
            scoreboard objectives add bss_rrandomvalue dummy
            scoreboard objectives add bss_rseeddefined dummy
            scoreboard players set @s bss_rm 124456
            scoreboard players set @s bss_ra 8121
            scoreboard players set @s bss_rc 28411
            scoreboard players set @s bss_rtemp 0
            scoreboard players set @s bss_rvalue 0
            scoreboard players set @s bss_rmax 0
            scoreboard players set @s bss_rmin 0
            scoreboard players set @s bss_rrandomvalue 0
            scoreboard players set @s bss_rseeddefined 0`
        },
        {
            root: true,
            path: "./bss_modules/random/next.mcfunction",
            content: `var bss_rtemp = bss_ra
            operation bss_rtemp * bss_rseed
            operation bss_rtemp + bss_rc
            operation bss_rtemp % bss_rm
            var bss_rseed = bss_rtemp
            var bss_rrandomvalue = bss_rtemp
            operation bss_rrandomvalue % bss_rmax
            operation bss_rrandomvalue + bss_rmin`
        }
    ]

    return {
        content: `execute as @s[tag=!bss_rsetup] run function ${config.namespace}:bss_modules/random/setup
        scoreboard players set @s bss_min ${min}
        scoreboard players set @s bss_max ${max}
        execute as @s run function ${config.namespace}:bss_modules/random/next
        scoreboard players operation @s ${scoreboard} = @s bss_rrandomvalue`,
        additionalFiles
    }
}