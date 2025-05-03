const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');
const User = require('./UserModel'); // Ensure correct path if necessary
const Vendor = require('./VendorModel'); // Ensure correct path if necessary

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false,
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
    product_category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    product_selection: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lead_status: {
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
    },
    createdByName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Vendor,
            key: 'uuid'
        },
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true,
    freezeTableName: true
});

// Define associations
User.hasMany(Lead, { foreignKey: 'uuid' });
Lead.belongsTo(User, { foreignKey: 'uuid' });

Vendor.hasMany(Lead, { foreignKey: 'createdBy' });
Lead.belongsTo(Vendor, { foreignKey: 'createdBy' });

module.exports = Lead;
