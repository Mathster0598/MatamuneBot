const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, inviteUrl } = require('./config.json');
const Util = require('./utility/utilities.js');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// Dynamic Commands
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Cooldowns
const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
	console.log('Invite url: ', inviteUrl);
});

const activities_list = [
	['PLAYING', [
		'Furyoku Catcher',
		'with Ponchi & Conchi',
		'with Princess Hao',
		'Ghost Hunter',
		'Jean Finder',
		'Oni Collector',
		'Soul Tracker',
		'with Tamao\'s heart',
		'Relaxing Simulator',
		'Manta Punter',
	]],
	['LISTENING', [
		'Yoh\'s Playlist',
	]],
	['STREAMING', [
		'Shaman Fights',
		'Yoh VS Hao',
	]],
];

client.on('ready', () => {
	client.user.setActivity(`${prefix}help`);
	setInterval(() => {
		const type = Math.floor(Math.random() * activities_list.length);
		const activity = Math.floor(Math.random() * activities_list[type][1].length);
		const options = {};
		options.type = activities_list[type][0];
		if(activities_list[type][0] === 'STREAMING') options.url = 'https://www.twitch.tv/mathster_live';
		client.user.setActivity(
			activities_list[type][1][activity], options);
	}, 30000);
});

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args, commandName);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (!user) return;
	if (user.bot) return;
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	const messageCheck = await Util.messageCheck(reaction.message.guild.id, reaction.message.id).catch(console.error);
	if (messageCheck) {
		if (messageCheck.get('purpose') === 'Vanity Set Role') {
			if (reaction.message.author.id === client.user.id) await Util.vanityManageRole(reaction, user, 'add');
		}
	}
});

client.on('messageReactionRemove', async (reaction, user) => {
	if (!user) return;
	if (user.bot) return;
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	const messageCheck = await Util.messageCheck(reaction.message.guild.id, reaction.message.id).catch(console.error);
	if (messageCheck) {
		if (messageCheck.get('purpose') === 'Vanity Set Role') {
			if (reaction.message.author.id === client.user.id) await Util.vanityManageRole(reaction, user, 'remove');
		}
	}
});

client.on('messageDelete', async message => {
	await Util.messageRemove(message.guild.id, message.id).catch(console.error);
});

client.login(token);