const { Sequelize } = require('sequelize');
const sequelize = require('../util/database.js');

const Passwords = sequelize.define(
    'Passwords',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        hashedPassword: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    }
);

module.exports = Passwords;
