const { DataTypes } = require("sequelize");
const config = require("../../config");
const bcrypt = require("bcrypt");
const Event = require("./eventModel");
const Group = require("./groupModel");
const Eventuser = require("./eventUserModel");

const User = config.sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isModerator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isConditionChecked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (User) => {
        if (User.password && User.password != "") {
          const hashedPassword = await bcrypt.hash(User.password, 10);
          User.password = hashedPassword;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password !== "") {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
    },
  }
);

User.belongsToMany(Event, { through: Eventuser });
Event.belongsToMany(User, { through: Eventuser });

Event.belongsTo(User);
Group.belongsTo(User);

// User.belongsToMany(Group, { through: GroupUser });
// Group.belongsToMany(User, { through: GroupUser });

module.exports = User;
