const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/Database.js");
const User = require('./UserModel.js'); // Ensure correct path if necessary

const Representative = db.define('representative', {
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'uuid'
        },
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    totalVendors: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true
});

User.hasOne(Representative, { foreignKey: 'uuid' });
Representative.belongsTo(User, { foreignKey: 'uuid' });

module.exports = Representative;
