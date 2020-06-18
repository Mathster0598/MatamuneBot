const Sequelize = require('sequelize');
const { db } = require('../config.json');

module.exports = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: `database/${db}`,
});