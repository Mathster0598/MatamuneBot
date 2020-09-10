module.exports = {
	name: 'say',
	description: 'Make Matamune say something!',
	guildOnly: true,
	aliases: ['say'],
	permission: 'View Channel, Manage Roles, Add Reactions & Send Messages',
	usage: '[channel]',
	cooldown: 4,
	async execute(message, args) {

		// check if is more than 1 argument
		if (args.length > 1) return message.reply('⚠️ Too many arguments, commands only accepts 1!').catch(console.error);

		// checks if is a channel
		if (!message.mentions.channels.first()) return message.reply('⚠️ Invalid Argument, must be a valid channel!').catch(console.error);

		// instruction prompt
		const msgPrompt = await message.reply(
			'Type your message. Type `exit` to stop/cancel.',
		);
		// make sure messages are from author
		const filter = (m) => message.author.id === m.author.id;

		// async function for message input
		const msgInput = await msgPrompt.channel
			.awaitMessages(filter, {
				time: 25000,
				max: 1,
				errors: ['time'],
			})
			.catch((err) => {
				console.log(err);
				msgPrompt.delete();
				return message.channel.send('❌ You did not enter any input!');
			});

		// gets the message
		const msg = msgInput.first();

		// cancels command upon typing 'exit'
		if (msg.content === 'exit') return message.reply('🛑 Cancelled').catch(console.error);

		// send message to specified channel
		if (args[0] && message.mentions.channels.first()) return message.mentions.channels.first().send(msg);

		// Send message to same channel
		message.channel.send(msg);
	},
};
