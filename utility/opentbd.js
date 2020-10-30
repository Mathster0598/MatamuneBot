const fetch = require('node-fetch');
const { sessions, categories } = require('../models/opentdb-model.js');
const { trivia } = require('../config.json');

const Token = sessions();
Token.sync();

const Category = categories();
Category.sync();

const dbURL = trivia.source;

const codes = ['Success', 'No results', 'Invalid parameter', 'Token not found', 'Token empty'];

module.exports = {
	async getToken() {
		const result = await fetch(`${dbURL}/api_token.php?command=request`);
		if (result !== 0) return console.log(`Received code: ${codes[result.response_code]} while trying to get token.`);
		else console.log(`Success! Token: ${result.token}`);
		return result.token;
	},
	async resetToken(token) {
		const result = await fetch(`${dbURL}/api_token.php?command=reset&token=${token}`);
		if (result !== 0) return console.log(`Received code: ${codes[result.response_code]} while trying to get token.`);
		else console.log(`Success! Token: ${result.token}`);
		return result.token;
	},
	async checkToken(guild) {
		const checkToken = await Token.findAll().catch(console.error);
		if (checkToken) { return checkToken; }
		else {
			const token = this.getToken();
			const session_token = {
				values: {
					token: token,
					guild: guild,
				},
				condition: {
					where: { guild: guild },
				},
			};
			const updateToken = await Token.update(session_token.values, session_token.condition);
			if (!updateToken) console.log('Database was not updated');
			else return updateToken;
		}
	},
	async saveCategories(guild) {
		const result = await fetch(`${dbURL}/api_category.php`);
		if (result) { return console.log('No categories found!'); }
		else {
			result.trivia_categories.array.forEach(async item => {
				await Category.create({
					guild: guild,
					categoryId: item.id.toString(),
					categoryName: item.name,
				}).catch(console.error);
			});
		}
		return 'success';
	},
};

