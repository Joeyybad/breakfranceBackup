const { DataTypes } = require('sequelize');
const config =  require('../../config');



const Group = config.sequelize.define('groups', {
    // Model attributes are defined here
    id:{
        type: DataTypes.INTEGER, 
        primaryKey:true, 
        autoIncrement: true
    },
    group_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    group_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    group_city: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
    group_img : {
        type: DataTypes.STRING(100),
    }
  }, {
    // Other model options go here
  });

 

  module.exports = Group