const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name] [args]',
	cooldown: 5,
	async execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => '`' + command.name + '`').join(', '));
			data.push(`\nYou can send \`${prefix}help [command name] [args]\` to get info on a specific command!`);

			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ve sent you a DM with all my commands!');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
				});
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) {
			const usage = {};
			const arg = args[1];
			if (typeof command.usage === 'object') {
				if (arg && command.usage[arg] === undefined) {
					return message.reply('⚠️ That\'s not a valid argument!');
				}
				else if (arg && command.usage[arg]) {
					usage.val = command.usage[arg];
				}
				else {
					usage.val = Object.keys(command.usage);
				}
			}
			else {
				usage.val = command.usage;
			}
			data.push(`**Usage:** ${prefix}${command.name} ` +
				`${Array.isArray(usage.val) ? usage.val.join('|') : usage.val}`);
		}

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.send(data, { split: true });

	},
};