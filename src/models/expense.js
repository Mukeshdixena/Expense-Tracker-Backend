const { Sequelize } = require('sequelize');

const sequelize = require('../util/database');

const Expense = sequelize.define(
    'Expense',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        amount: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    }
);

module.exports = Expense;
