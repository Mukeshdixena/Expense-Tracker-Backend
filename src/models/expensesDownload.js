const { Sequelize } = require('sequelize');

const sequelize = require('../util/database.js');

const ExpenseDownload = sequelize.define(
    'ExpenseDownload',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        FileUrl: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    }
);

module.exports = ExpenseDownload;
