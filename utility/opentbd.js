const fetch = require('node-fetch');
const { sessionToken } = require('../models/opentdb-model.js');
const { trivia } = require('../config.json');

const dbURL = trivia.source;

const codes = ['Success', 'No results', 'Invalid parameter', 'Token not found', 'Token empty'];

module.exports = {
	async getToken() {
		const result = await fetch(`${dbURL}/api_token.php?command=request`);
		if(result !== 0) return console.log(`Received code: ${codes[result.response_code]} while trying to get token.`);
		else console.log(`Success! Token: ${result.token}`);
		return result.token;
	},
	async resetToken(token) {
		const result = await fetch(`${dbURL}/api_token.php?command=reset&token=${token}`);
		if(result !== 0) return console.log(`Received code: ${codes[result.response_code]} while trying to get token.`);
		else console.log(`Success! Token: ${result.token}`);
		return result.token;
	},
	// async checkToken() {
	// 	const checkToken = await Vanity.findAll().catch(console.error);
	// 	if(!checkToken) {

	// 	}
	// }
	// async getQuestions(number) {

	// },
};

