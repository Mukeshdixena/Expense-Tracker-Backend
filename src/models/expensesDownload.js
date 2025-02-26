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
        UserId: {  // Explicitly defining the foreign key
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Make sure the table name matches your `User` model
                key: 'id',
            },
            onDelete: 'CASCADE', // Delete downloads if the user is deleted
        },
    }
);

module.exports = ExpenseDownload;
