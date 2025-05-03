// models/Vendor.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');
const User = require('./UserModel'); // Ensure correct path if necessary

const Vendor = sequelize.define('Vendor', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true,
    freezeTableName: true // Optional: keeps the table name singular
});

// Define associations
User.hasOne(Vendor, { foreignKey: 'uuid' });
Vendor.belongsTo(User, { foreignKey: 'uuid' });

module.exports = Vendor;
