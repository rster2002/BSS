/*

MIT Licence

Copyright 2018-2019 Bjørn Reemer

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

module.exports = {
	random: {
		files: [
			{
				name: "nextrandom.mcfunction",
				content: `{{ var bss_rtemp = bss_ra }}
				{{ operation bss_rtemp * bss_rseed }}
				{{ operation bss_rtemp + bss_rc }}
				{{ operation bss_rtemp % bss_rm }}
				{{ var bss_rseed = bss_rtemp }}
				{{ var bss_rrandomvalue = bss_rtemp }}
				{{ operation bss_rrandomvalue % bss_rmax }}
				{{ operation bss_rrandomvalue + bss_rmin }}`
			},
			{
				name: "player_init.mcfunction",
				content: `{{ var bss_rseed }}
				{{ var bss_rrandom }}
				{{ var bss_rm = 134456 }}
				{{ var bss_ra = 8121 }}
				{{ var bss_rc = 28411 }}
				{{ var bss_rtemp = 0 }}
				{{ var bss_rvalue = 0 }}
				{{ var bss_rmax = 0 }}
				{{ var bss_rmin = 0 }}
				{{ var bss_rrandomvalue = 0 }}
				{{ var bss_rseeddefined = 0 }}

				{{ if bss_rseeddefined = 0 => }} <<
					execute store result score @s bss_rseed run data get entity @r Pos[0]
					execute if score @s bss_rseed matches ..0 run {{ operation bss_rseed * -1 }}
					{{ operation bss_rseed % m }}
					{{ var bss_rrandom = bss_rseed }}
					{{ var bss_rseeddefined = 1 }}
				>>

				tag @s add bss_rsetup`
			}
		],
		setup: `execute as @s[tag=!bss_rsetup] run {{ call $_namespace:bss_modules/random/player_init }}`
	}
}
