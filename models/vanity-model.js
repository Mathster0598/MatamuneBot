const Sequelize = require('sequelize');
const db = require('../utility/database.js');

module.exports = db.define('vanity', {
	guild: Sequelize.STRING,
	roleID: Sequelize.STRING,
	name: Sequelize.STRING,
	color: Sequelize.STRING,
	emote: Sequelize.STRING,
});