const { DataTypes } = require('sequelize');
const config =  require('../../config');
const Event = require('./eventModel');

const Comment = config.sequelize.define('comments', {
    // Model attributes are defined here
    id:{
        type: DataTypes.INTEGER, 
        primaryKey:true, 
        autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, );

    

  module.exports = Comment
  