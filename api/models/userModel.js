const { DataTypes } = require('sequelize');
const config = require('../../config');
const bcrypt = require('bcrypt');
const Event = require('./eventModel');
const Group = require('./groupModel');
const Eventuser = require('./eventUserModel');
const GroupUser = require('./groupUserModel'); // Assurez-vous d'importer le modèle GroupUser

const User = config.sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isModerator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  hooks: {
    beforeCreate: async (User) => {
      if (User.password && User.password != "") {
        const hashedPassword = await bcrypt.hash(User.password, 10);
        User.password = hashedPassword;
      }
    },
    beforeUpdate: async (User) => {
      if (User.password && User.password != "") {
        const hashedPassword = await bcrypt.hash(User.password, 10);
        User.password = hashedPassword;
      }
    }
  }
});

User.belongsToMany(Event, { through: Eventuser });
Event.belongsToMany(User, { through: Eventuser });

User.belongsToMany(Group, { through: GroupUser });
Group.belongsToMany(User, { through: GroupUser });

module.exports = User;
