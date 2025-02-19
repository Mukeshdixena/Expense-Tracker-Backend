const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database.js');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true, // Ensures a valid email format
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [6, 255], // Ensures password length is at least 6 characters
            },
        },
        isPremiumMember: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Default value for new users
        },
    },
    {
        tableName: 'users', // Explicitly set table name to avoid pluralization issues
        timestamps: true, // Adds createdAt & updatedAt fields automatically
    }
);

module.exports = User;
