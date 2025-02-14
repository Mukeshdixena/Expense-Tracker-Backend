const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authonticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, 'privetekey');
        console.log("user >>>", user);

        User.findByPk(user.UserId)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err));

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    authonticate
}