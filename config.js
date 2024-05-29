const { Sequelize, DataTypes } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('blog', 'root', '', {
  host: 'localhost',
  dialect: 'mysql' ,
});

// Synchroniser les associations
sequelize.sync();

const sessionSecret ='keyboard dog'

module.exports = { sequelize, sessionSecret};
