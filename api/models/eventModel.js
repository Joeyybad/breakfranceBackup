const { DataTypes } = require('sequelize');
const config = require('../../config');
const Categorie = require('./categorieModel');
const Group = require('./groupModel');
const Comment = require('./commentModel');
const GroupEvent = require('./groupEventModel');

const Event = config.sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    event_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    event_description: {
        type: DataTypes.TEXT,
        allowNull: false
    }, 
    event_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    event_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    available_place: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    event_image: {
        type: DataTypes.STRING(100),
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

Event.hasOne(Categorie);
Group.belongsToMany(Event, { through: GroupEvent });
Event.belongsToMany(Group, { through: GroupEvent });


module.exports = Event;
