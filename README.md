# Matamune

[![N|Solid](https://i.imgur.com/RpLUUV2.jpg)](https://shamanking-project.com/)

<p align="right">
	<a href="https://discord.gg/s4cmWWd">
		<img src="https://discordapp.com/api/guilds/723781005093240862/widget.png?style=shield" alt="Discord Server">
  	</a>
</p>

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

### Start Bot
```sh
$ npm start
```

### Permissions

The bot needs atleast the following permissions:
- `SEND_MESSAGES` - to send messages to a channel/s.
- `ADD_REACTIONS` - to add reactions.
- `VIEW_CHANNEL`  - to view a channel, which includes reading messages in text channels.
- `READ_MESSAGE_HISTORY` -  to read past messages.
- `MANAGE_ROLES ` - to manage and edit roles.

It also important to note that the user issuing the commands has the required permissions. To check specific command permission requirements, do `[prefix]help [command] [arg]`.

For more information about discord permissions, visit [here](https://discord.com/developers/docs/topics/permissions).


### Plugins

- TBA


### Development

Want to contribute? Great! Matamune is a open source project, feel free to fork, clone & download! Join the [discord](https://discord.gg/s4cmWWd) for more info!

### Todos

 - Dynamic topic trivia
 - User profiles & more!
 - Add more commands!
 - Unravel spaghetti

License
----

ISC