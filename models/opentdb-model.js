const Sequelize = require('sequelize');
const db = require('../utility/database.js');

module.exports = {
	async sessions() {
		const tokens = await db.define('opentdb_tokens', {
			guild: Sequelize.STRING,
			token: Sequelize.STRING,
		});

		return tokens;
	},
	async categories() {
		const categories = await db.define('opentdb_categories', {
			guild: Sequelize.STRING,
			categoryId: Sequelize.STRING,
			categoryName: Sequelize.STRING,
		});

		return categories;
	},
};