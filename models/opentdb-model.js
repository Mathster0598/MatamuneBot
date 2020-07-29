const Sequelize = require('sequelize');
const db = require('../utility/database.js');

module.exports = {
	async sessionToken() {
		const token = await db.define('opentdb_tokens', {
			token: Sequelize.STRING,
		});

		return token;
	},
};