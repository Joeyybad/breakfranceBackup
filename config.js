const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('breakfrancenode', 'root', '', {
  host: 'localhost',
  dialect: 'mysql' ,
});


sequelize.sync();

const sessionSecret ='keyboard dog'

module.exports = { sequelize, sessionSecret};
