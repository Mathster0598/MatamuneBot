const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const Vanity = require('./models/vanity-model.js');

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
	client.user.setActivity('Furyoku Catcher');
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
		command.execute(message, args, prefix, commandName);
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
	if (reaction.message.author.id === client.user.id) await VanityAddRole(reaction, user).catch(console.error);
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
	if (reaction.message.author.id === client.user.id) await VanityRemoveRole(reaction, user).catch(console.error);
});

async function VanityAddRole(reaction, user) {
	// Sync to Vanity Table
	Vanity.sync();

	const condition = {
		where: {
			guild: [reaction.message.guild.id],
			emote: reaction.emoji.name,
		},
	};
	const vanity = await Vanity.findOne(condition).catch(console.error);

	if (!vanity) return console.log('Not a vanity role');
	// Add role
	await user.presence.member.roles.add(vanity.get('roleID'), 'Assign Vanity Roles').catch(console.log);

}

async function VanityRemoveRole(reaction, user) {
	// Sync to Vanity Table
	Vanity.sync();

	const condition = {
		where: {
			guild: [reaction.message.guild.id],
			emote: reaction.emoji.name,
		},
	};
	const vanity = await Vanity.findOne(condition).catch(console.error);

	if (!vanity) return console.log('Not a vanity role');
	// Add role
	await user.presence.member.roles.remove(vanity.get('roleID'), 'Removed Vanity Roles').catch(console.log);

}

client.login(token);