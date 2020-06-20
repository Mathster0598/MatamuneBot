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
	async messageTracking(guild, messageID, purpose) {
		const tracking = require('../models/message-tracking-model.js');
		tracking.sync();

		try {
			const trackingResult = await tracking.create({
				guild: guild,
				messageID: messageID,
				purpose: purpose,
			});

			if (trackingResult) console.log('Message tracked!');

			return await trackingResult;
		}
		catch (error) {
			console.log(error);
		}
	},
	async messageCheck(guild, messageID) {
		const tracking = require('../models/message-tracking-model.js');
		tracking.sync();

		try {
			const trackingResult = await tracking.findOne({
				where: {
					guild: guild,
					messageID: messageID,
				},
			});

			if (trackingResult) console.log('Message found!');

			return await trackingResult;
		}
		catch (error) {
			console.log(error);
		}
	},
	async messageRemove(guild, messageID) {
		const tracking = require('../models/message-tracking-model.js');
		tracking.sync();

		try {
			const trackingResult = await tracking.destroy({
				where: {
					guild: guild,
					messageID: messageID,
				},
			});

			if (trackingResult) console.log('Message Deleted');

			return await trackingResult;
		}
		catch (error) {
			console.log(error);
		}
	},
};
