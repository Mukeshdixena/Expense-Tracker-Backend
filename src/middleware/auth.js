const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.PRIVET_KEY);

        const user = await User.findById(decoded.UserId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = {
    authenticate
};
