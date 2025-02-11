const Sequelize = require('sequelize');

const sequelize = new Sequelize('expence-app', 'root', 'Chintu2@2002', {
    dialect: 'mysql',
    host: 'localhost'
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize

