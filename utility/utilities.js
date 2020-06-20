module.exports = {
	async match(needle) {
		const found = x => ({
			on: () => found(x),
			otherwise: () => x,
		});

		const find = x => ({
			on: (pred, fn) => (pred(x) ? found(fn(x)) : find(x)),
			otherwise: fn => fn(x),
		});

		return find(needle);
	},
	async vanityManageRole(reaction, user, action) {
		// require Vanity model
		const Vanity = require('../models/vanity-model.js');

		// Sync to Vanity Table
		Vanity.sync();

		const condition = {
			where: {
				guild: [reaction.message.guild.id],
				emote: reaction.emoji.name,
			},
		};
		try {
			const vanity = await Vanity.findOne(condition);

			if (!vanity) return console.log('Not a vanity role');
			// Add role
			if (action === 'add') await user.presence.member.roles.add(vanity.get('roleID'), 'Assign Vanity Role');
			// Remove role
			else if (action === 'remove') await user.presence.member.roles.remove(vanity.get('roleID'), 'Unassign Vanity Role');
			else console.log('Not a valid action');
		}
		catch (error) {
			console.log(error);
		}
	},
	async checkPermission(member, perms, options = { checkAdmin: true, checkOwner: true }) {
		try {
			return await member.hasPermission(perms, options);
		}
		catch (error) {
			console.log(error);
		}
	},
};
