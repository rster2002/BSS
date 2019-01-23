# Bluestone Script
or BSS was made to make the life of map and datapack makers easier by creating a compiler that is powerful and is easy to use. It has features like repeated rendering, nested loottables, functions and lots more!

### Installation
Download the latest version [here](https://github.com/rster2002/BSS/releases/latest). Once you've downloaded BSS, it will keep itself updated.

### Usage
I've been working on making it as frictionless as posible to work with BSS. It doesn't replace any syntax you know from minecraft already. It only add extra options to make creating datapacks easier.

(The example beneath doesn't work yet in the public version)
```
{{ as @a[tag=barbarian] || @a[tag=fighter] => }} {{ @damage => }} <<
  {{ var random = math.random(1,100) }}
  {{ if random > 75 && random <= 100 => }} <<
    effect give @s strength 5 2
  >>
>>
```

In the example above we've created an ability for everyone who has the `barbarian` or the `fighter` tag. When you take damage, you have a random change to get strength 3 for 5 seconds. It might look a little bit complicated but if you would write something like this without BSS it would quickly be more lines of code. This code is also optimized to make sure there are no extra commands running at one given time. Everything inside of `<< ... >>` will be compiled into a different file so you are only running code that actually get executed.

Let's take a look at another example:

(Again, the example beneath doesn't work yet in the public version)
```
{{ as @a => }} {{ if holding minecraft:clock => }} <<
  {{ var time = time.daytime }}
  tellraw @s [{"score": {"name": "@s", "objective": "time"}}]
>>
```

Here we check if a player has a clock selected and then display the time in ticks. Pretty simple, but if you were to create this without BSS it would quickly get bigger and more complicated. Here we are using `{{ var }}` which is actually just the `scoreboard` command, but `{{ var }}` doesn't require you to first create the scoreboard by hand. It does that for you. And, if you want, it can put those `scoreboard objectives add` commands into a specific file like `setup.mcfunction` for example.

If you are interested in learning more, check out the wiki on github. 
