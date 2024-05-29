const { DataTypes } = require('sequelize');
const config = require('../../config');

const GroupUser = config.sequelize.define('groupUsers', {
    isModerator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    // Options du modèle
});

module.exports = GroupUser;