# Matamune

[![N|Solid](https://i.imgur.com/RpLUUV2.jpg)](https://shamanking-project.com/)

A bot inspired by our favorite neko from the Shaman King manga.

### Tech

* [discord.js](https://discord.js.org/) - A powerful node.js module that allows you to interact with the Discord API.
* [node.js](https://nodejs.org/) - Is a JavaScript runtime built on Chrome's V8 JavaScript engine.

### Installation

Requires [Node.js](https://nodejs.org/) v12+ to run.

Install the dependencies and devDependencies

```sh
$ cd MatamuneBot
$ npm install -d
```

Copy and Setup config file

```sh
$ cp config.sample.json config.json
$ touch config.json
```
```
{
	"prefix": "your-prefix",
	"token": "your-token",
	...
}
```

To setup bot application and get token, visit [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).

Setup [Discord Embed](https://discordjs.guide/popular-topics/embeds.html) defaults
```
{
...
	"embed": {
		"author": {
			"icon_url": "your-default-icon-here",
			"url": "your-default-url-here"
		},
		"fields": []
	}
...
}
```

### Database

The bot utilizes [Sequelize](https://discordjs.guide/sequelize/) with [SQLite](https://www.sqlite.org/) as its ORM. You can create as many databases as you want, but for our purposes, we are utilizing only 1. Create your database.sqlite file on `/database` folder or modify the `/utility/database.js` file to use your prefered database engine.

Modify the config and specify your database name
```
{
	"db": "your-db-here"
}
```
For multiple databases
```
{
	"db": {
		"db1": "db1-name-here",
		"db2": "db2-name-here"
	}
}
```

### Start bot
```sh
$ npm start
```

### Plugins

- TBA


### Development

Want to contribute? Great!

### Todos

 - Unravel spaghetti
 - Add more commands!

License
----

ISC