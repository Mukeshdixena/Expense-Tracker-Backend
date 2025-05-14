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
        fileUrl: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        UserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    }
);

module.exports = ExpenseDownload;
