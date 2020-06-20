const Sequelize = require('sequelize');
const db = require('../utility/database.js');

module.exports = db.define('message_tracking', {
	guild: Sequelize.STRING,
	messageID: Sequelize.STRING,
	purpose: Sequelize.STRING,
});