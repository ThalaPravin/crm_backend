// models/TPMSModel.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');
const Lead = require('./LeadModel'); // Ensure correct path if necessary

const TPMS = sequelize.define('TPMS', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Lead,
            key: 'uuid'
        },
        validate: {
            notEmpty: true
        }
    },
    adharNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    panNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    ifscCode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    fullNameAsPerBank: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true,
    freezeTableName: true
});

// Define associations
Lead.hasOne(TPMS, { foreignKey: 'uuid' });
TPMS.belongsTo(Lead, { foreignKey: 'uuid' });

module.exports = TPMS;
