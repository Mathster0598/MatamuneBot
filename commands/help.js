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
		const usageInfo = {};


		if (!command) {
			return message.reply('that\'s not a valid command!');
		}
		if (command.usage) {
			const arg = args[1];
			if (typeof command.usage === 'object') {
				if (arg && command.usage[arg] === undefined) {
					return message.reply('⚠️ That\'s not a valid argument!');
				}
				else if (arg && command.usage[arg]) {
					const options = command.usage[arg];
					if (typeof options === 'object') {
						if (options.description) usageInfo.description = options.description;
						if (options.usage) usageInfo.usage = options.usage;
						if (options.permission) usageInfo.permission = options.permission;
					}
					else {
						command.usage = options;
					}
				}
				else {
					usageInfo.usage = Object.keys(command.usage);
				}
			}
		}
		console.log('usage', usageInfo);

		if (command.name) data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) {
			data.push(`**Description:** ${(usageInfo.description) ? usageInfo.description : command.description}`);
		}
		if (command.usage || usageInfo.usage) {
			data.push(`**Usage:** ${prefix}${command.name} ` +
				`${(usageInfo.usage) ? !(Array.isArray(usageInfo.usage))
					? usageInfo.usage : usageInfo.usage.join('|') : command.usage}`);
		}
		if (command.permission || usageInfo.permission) {
			data.push(`**Permission:** ${(command.permission) ? command.permission : usageInfo.permission}`);
		}
		if (command.cooldown) data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		if (!data.length) return message.channel.send('Command creator didn\'t add any information! 🙄');
		message.channel.send(data, { split: true });

	},
};