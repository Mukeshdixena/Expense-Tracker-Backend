const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authonticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, 'privetekey');

        User.findByPk(user.UserId)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.error(err));

    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    authonticate
}