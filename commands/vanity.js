const Vanity = require('../models/vanity-model.js');
const { embed, prefix, perms } = require('../config.json');
const Util = require('../utility/utilities.js');

// Sync to Vanity Table
Vanity.sync();

module.exports = {
	name: 'vanity',
	description: 'Add and Manage Vanity Roles to make your server fancy.',
	guildOnly: true,
	aliases: ['vanity'],
	permission: 'View Channel, Manage Roles, Add Reactions & Send Messages',
	usage: {
		add: {
			description: 'Add a vanity role and set its color and the emote it should be represented as.',
			usage: 'add [role] [color] [emote]',
			permission: 'Manage Roles & Send Messsages',
		},
		remove: {
			description: 'Remove a  vanity role from ther server/user.',
			usage: 'remove {role|user [role1] ... [role5]}',
			permission: 'Manage Roles & Send Message(role) | Send Messages(user)',
		},
		edit: {
			description: 'Edit a specific vanity role.',
			usage: 'edit',
			permission: 'Manage Roles, Add Reactions & Send Messages',
		},
		list: {
			description: 'List all server vanity roles.',
			usage: 'list',
			permission: 'Add Reactions & Send Messages',
		},
		set: {
			description: 'Send a reaction selection for users to assign their desired vanity role/s.',
			usage: 'set',
			permission: 'View Channel, Manage Roles, Add Reactions & Send Messages',
		},
	},
	cooldown: 7,
	async execute(message, args, commandName) {
		if (!args.length) return message.channel.send(`⚠️ You didn't provide any arguments, ${message.author}!`).catch(console.log);
		const arg = args[0].toLowerCase();
		const userPerms = [
			'MANAGE_ROLES',
		];
		const bot = message.member.guild.me;
		const member = message.guild.member(message.author);
		const botPermMessage = '❌ I do not have the correct permissions.';
		const userPermMessage = '❌ You do not have the correct permissions.';

		embed.fields = [];
		embed.footer = {};

		(await Util.match(arg)).on(a => a === 'add', async () => {
			if (args.length > 4) return message.reply('⚠️ Command only takes 3 arguments, [role] [color] [emote]').catch(console.error);

			const botPerms = perms.concat(['MANAGE_ROLES']);
			if (!Util.checkPermission(bot, botPerms)) return message.reply(botPermMessage).catch(console.error);
			if (!Util.checkPermission(member, userPerms)) return message.reply(userPermMessage).catch(console.error);

			const vanity = await Vanity.findAll({ where: { guild: [message.guild.id] } });

			const subArgs = {
				name: args[1],
				color: args[2],
				emote: args[3],
			};

			if (!subArgs.name) {
				return message.reply('⚠️ Please supply a role name.').catch(console.error);
			}
			else if (!(/^#[0-9A-F]{6}$/i.test(subArgs.color))) {
				return message.reply('⚠️ Please use a valid HEX color code.').catch(console.error);
			}
			else if (!subArgs.emote) {
				return message.reply('⚠️ Please use a valid emote.').catch(console.error);
			}
			else if (vanity.find(e => e.emote === subArgs.emote)) {
				return message.reply('⚠️ Emote is already being used.').catch(console.error);
			}
			else {
				const roleResult = await message.guild.roles.create({
					data: {
						name: subArgs.name,
						color: subArgs.color,
					},
					reason: 'Vanity Role',
				}).catch(console.error);
				const role = await roleResult.toJSON();

				const vanityResult = await Vanity.create({
					guild: role.guild,
					roleID: role.id.toString(),
					name: subArgs.name,
					color: subArgs.color,
					emote: subArgs.emote,
				}).catch(console.error);
				const resp = await vanityResult.toJSON();
				return message.reply(`Role **${resp.name}** added, Do **${prefix + commandName} set** to assign the role.`);
			}
		}).on(a => a === 'remove', async () => {
			if (args.length > 7) return message.reply('❌ You can only remove up to 5 roles at a time.').catch(console.error);
			if (!message.mentions.roles) return message.reply('❌ Please supply the roles that you want to remove.').catch(console.error);

			const subArgs = {
				roles: message.mentions.roles,
			};
			const role = [];
			const roleNames = [];
			subArgs.roles.forEach(e => {
				role.push(e.id.toString());
				roleNames.push(e.name);
			});
			const roleMap = roleNames.map(r => r).join(', ');

			if (args[1] === 'role') {
				const botPerms = perms.concat(['MANAGE_ROLES']);
				if (!Util.checkPermission(bot, botPerms)) return message.reply(botPermMessage).catch(console.error);
				if (!Util.checkPermission(member, userPerms)) return message.reply(userPermMessage).catch(console.error);

				const rolePrompt = await message
					.reply(`Are you sure you want to remove the **${roleMap}** role/s?`)
					.catch(console.error);

				await rolePrompt.react('✅');
				await rolePrompt.react('❌');

				const roleFilter = (reaction, user) => {
					return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
				};
				const roleResult = await rolePrompt.awaitReactions(
					roleFilter, { max: 1, time: 20000, errors: ['time'] })
					.catch(async end => {
						console.log(end);
						await rolePrompt.delete();
						message.reply('⏰ Prompt expired, please run the command again.');
					});

				const reaction = roleResult.first();

				if (reaction.emoji.name === '✅') {
					const vanityResult = await Vanity.destroy({ where: { roleID: role } }).catch(console.error);
					if (!vanityResult) return message.reply('❌ Role/s supplied does not exist.');

					role.forEach(async id => {
						const guildResult = await message.guild.roles.fetch(id).catch(console.error);
						await guildResult.delete('Manually removed');
					});

					await rolePrompt.delete();
					return message.reply(`**${roleMap}** successfully deleted`);
				}
				else {
					await rolePrompt.delete();
					return message.reply('🛑 Cancelled');
				}
			}
			else if (args[1] === 'user') {
				const rolePrompt = await message
					.reply(`Are you sure you want to unassign the **${roleMap}** role/s?`)
					.catch(console.error);

				await rolePrompt.react('✅');
				await rolePrompt.react('❌');

				const roleFilter = (reaction, user) => {
					return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
				};
				const roleResult = await rolePrompt.awaitReactions(
					roleFilter, { max: 1, time: 20000, errors: ['time'] })
					.catch(async end => {
						console.log(end);
						await rolePrompt.delete();
						message.reply('⏰ Prompt expired, please run the command again.');
					});
				const reaction = roleResult.first();

				if (reaction.emoji.name === '✅') {
					const removeResult = await message.member.roles.remove(role, 'Unassign Vanity Roles')
						.catch(console.error);
					if (!removeResult) return message.reply('❌ Role/s was not removed from user, please check logs.');

					await rolePrompt.delete();
					return message.reply(`**${roleMap}** successfully unassigned`);
				}
				else {
					await rolePrompt.delete();
					return message.reply('🛑 Cancelled');
				}
			}
			else {
				return message.reply('⚠️ That\'s not a valid argument! Do **`' + `${prefix + commandName}` + '`** for more info');
			}
		}).on(a => a === 'edit', async () => {
			const botPerms = perms.concat(['MANAGE_ROLES', 'ADD_REACTIONS']);
			if (!Util.checkPermission(bot, botPerms)) return message.reply(botPermMessage).catch(console.error);
			if (!Util.checkPermission(member, userPerms)) return message.reply(userPermMessage).catch(console.error);
			if (args.length > 1) return message.reply('⚠️ Command takes no arguments').catch(console.error);

			const vanity = await Vanity.findAll({ where: { guild: [message.guild.id] } });

			if (!vanity.length) return message.reply('No roles have been added, poke the owner/mods 👀.').catch(console.error);

			// Role Picker
			const roles = vanity.map(t => t.dataValues) || '';
			const roleInfo = {
				roles: [],
				roleEmotes: [],
			};

			embed.author.name = 'React to edit assign roles';
			roles.forEach(e => {
				embed.fields.push({
					name: e.name,
					value: e.emote + ' - ' + `<@&${e.roleID}>`,
					inline: true,
				});
				roleInfo.roles.push({
					id: e.roleID,
					name: e.name,
					emote: e.emote,
				});
				roleInfo.roleEmotes.push(e.emote);
			});

			const rolePickerEmbed = await message.channel.send({ embed: embed });
			roles.forEach(async e => {
				await rolePickerEmbed.react(e.emote);
			});
			const roleFilter = (reaction, user) => {
				return roleInfo.roleEmotes.includes(reaction.emoji.name) && user.id === message.author.id;
			};

			const rolePickerCollection = await rolePickerEmbed.awaitReactions(
				roleFilter,
				{
					max: 1, time: 60000, errors: ['time'],
				})
				.catch(async err => {
					console.log(err);
					await rolePickerEmbed.delete();
					message.reply('⏰ Selection expired, please run the command again.');
				});

			const rolePickerResult = await rolePickerCollection.first();
			const role = roleInfo.roles.find(e => e.emote === rolePickerResult.emoji.name);

			if (!role) return message.reply('⚠️ Please resync roles with remote database.').catch(console.error);

			// Role edit options
			const rolePickerPrompt = await message.reply('Select parameter to edit:\n`Name: 📛`\n`Color: 🌈`\n`Emote: 😻`');
			await rolePickerPrompt.react('📛');
			await rolePickerPrompt.react('🌈');
			await rolePickerPrompt.react('😻');

			const editFilter = (react, user) => {
				return ['📛', '🌈', '😻'].includes(react.emoji.name) && user.id === message.author.id;
			};

			const rolePromptCollection = await rolePickerPrompt.awaitReactions(
				editFilter,
				{
					max: 1, time: 30000, errors: ['time'],
				})
				.catch(async err => {
					console.log(err);
					await rolePickerPrompt.delete();
					message.reply('⏰ Options expired, please run the command again.');
				});
			const rolePromptResult = await rolePromptCollection.first();

			if (!rolePromptResult) return message.reply('⚠️ Something went wrong with validating options, please try again.').catch(console.error);

			// Role edit prompt
			const editPrompt = await message.reply('Type to update. Type `exit` to stop/cancel.');
			await rolePickerEmbed.delete();
			await rolePickerPrompt.delete();
			const editPromptFilter = (m => message.author.id === m.author.id);

			const editMessages = await editPrompt.channel.awaitMessages(
				editPromptFilter, { time: 25000, max: 1, errors: ['time'] })
				.catch(async err => {
					console.log(err);
					editPrompt.delete();
					return message.channel.send('❌ You did not enter any input!');
				});
			const msg = editMessages.first();
			const updateProperties = {
				values: {},
				condition: { where: { guild: message.guild.id, roleID: role.id } },
			};

			if (msg.content === 'exit') return message.reply('🛑 Cancelled').catch(console.error);

			if (rolePromptResult.emoji.name === '📛') {
				updateProperties.values = { name: msg.content };
			}
			else if (rolePromptResult.emoji.name === '🌈') {
				if (!(/^#[0-9A-F]{6}$/i.test(msg.content))) return message.reply('⚠️ Please use a valid HEX color code.').catch(console.error);
				updateProperties.values = { color: msg.content };
			}
			else if (rolePromptResult.emoji.name === '😻') {
				updateProperties.values = { emote: msg.content };
			}
			else {
				return message.reply('⚠️ Something went wrong with picking an option')
					.catch(console.error);
			}

			const updateVanity = await Vanity.update(updateProperties.values, updateProperties.condition);
			if (!updateVanity) return message.reply('⚠️ Database was not updated, please check logs.').catch(console.error);

			const updateRole = await message.guild.roles.fetch(role.id).catch(console.error);
			const roleUpdated = await updateRole.edit(updateProperties.values).catch(console.error);
			if (!roleUpdated) return message.reply('⚠️ Role was not updated, please check logs.').catch(console.error);

			editPrompt.delete();
			return message.channel.send(`👏 <@&${role.id}> was successfully updated!`);

		}).on(a => a === 'list', async () => {
			const botPerms = perms.concat(['ADD_REACTIONS']);
			if (!Util.checkPermission(bot, botPerms)) return message.reply(botPermMessage).catch(console.error);
			if (args.length > 1) return message.reply('❌ Command takes no arguments').catch(console.error);
			const vanity = await Vanity.findAll({ where: { guild: [message.guild.id] } }).catch(console.error);

			if (!vanity.length) return message.reply('No roles have been added, poke the owner/mods 👀.');

			const roles = await vanity.map(t => t.dataValues) || '';
			embed.author.name = 'List of all vanity roles';
			embed.footer.text = `Do <${prefix + commandName} set> to assign roles.`;

			await roles.forEach(e => {
				embed.fields.push({
					name: e.emote + ' - ' + e.name,
					value: `<@&${e.roleID}>`,
					inline: true,
				});
			});
			return message.channel.send({ embed: embed });

		}).on(a => a === 'set', async () => {
			const botPerms = perms.concat(['MANAGE_ROLES', 'ADD_REACTIONS']);
			if (!Util.checkPermission(bot, botPerms)) return message.reply(botPermMessage).catch(console.error);
			if (!Util.checkPermission(member, userPerms)) return message.reply(userPermMessage).catch(console.error);
			if (args.length > 1) return message.reply('❌ Command takes no arguments').catch(console.error);

			const vanity = await Vanity.findAll({ where: { guild: [message.guild.id] } }).catch(console.error);

			if (!vanity.length) return message.reply('No roles have been added, poke the owner/mods 👀.');

			const roles = vanity.map(t => t.dataValues) || '';
			const roleInfo = {
				roles: [],
				roleEmotes: [],
			};

			embed.author.name = 'React to assign/remove roles';

			roles.forEach(e => {
				embed.fields.push({
					name: e.name,
					value: e.emote + ' - ' + `<@&${e.roleID}>`,
					inline: true,
				});
				roleInfo.roles.push({
					id: e.roleID,
					name: e.name,
					emote: e.emote,
				});
				roleInfo.roleEmotes.push(e.emote);
			});

			const setEmbed = await message.channel.send({ embed: embed }).catch(console.error);

			await Util.messageTracking(message.guild.id, setEmbed.id, 'Vanity Set Role');

			roles.forEach(async e => {
				await setEmbed.react(e.emote);
			});

		}).otherwise(() => {
			return message
				.reply('⚠️ That\'s not a valid argument! Do **`' + `${prefix + 'help ' + commandName}` + '`** for more info');
		});
	},
};