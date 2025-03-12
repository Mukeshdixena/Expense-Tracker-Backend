const user = require('../models/user');
const Password = require('../models/passwords');
const expense = require('../models/expense');
const { Sequelize } = require('sequelize'); // Ensure Sequelize is imported

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
function generateAccestoken(id, name) {
    return jwt.sign({ UserId: id, name: name }, process.env.PRIVET_KEY)
}
exports.getUser = async (req, res, next) => {
    const thisUsers = await user.findAll()
    if (!thisUsers) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUsers);
};
exports.getLeaderBoad = async (req, res, next) => {
    try {
        const users = await user.findAll({
            attributes: ['id', 'username', 'isPremiumMember',
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 0), 'totalAmount']
            ],
            include: [
                {
                    model: expense,
                    attributes: [],
                },
            ],
            group: ['user.id'],
            order: [[Sequelize.literal('totalAmount'), 'DESC']],
        });

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserById = async (req, res, next) => {
    const thisUser = await user.findByPk(req.user.id)

    if (!thisUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUser);

};
exports.getUserTotalAmount = async (req, res, next) => {
    const thisUser = await user.findByPk(req.user.id)

    if (!thisUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUser);

};

exports.postUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await user.create({
            username,
            email,
            totalAmount: 0,
            password: hashedPassword
        });
        await Password.create({ hashedPassword: hashedPassword, UserId: newUser.id });
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
exports.postUserPass = async (req, res, next) => {
    try {
        const { emailId, newPassword } = req.body;

        console.log(emailId, newPassword);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const currUser = await user.findOne({ where: { email: emailId } });

        if (!currUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currUserPass = await Password.findAll({ where: { UserId: currUser.id } });

        for (const currPass of currUserPass) {
            const isMatch = await bcrypt.compare(newPassword, currPass.hashedPassword);
            if (isMatch) {
                return res.json({ success: false, message: 'This password already exists, please choose another' });
            }
        }

        await Password.create({ hashedPassword, UserId: currUser.id });
        await currUser.update({ password: hashedPassword });

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.postPremium = async (req, res, next) => {

    const { isPremiumMember } = req.body;


    user.findByPk(req.user.id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'Expense not found' });
            }
            console.log(user.UserId)
            return user.update({ isPremiumMember });
        })
        .then(updatedExpense => {
            res.status(200).json({ message: 'Expense updated successfully', user: updatedExpense });
        })
        .catch(err => {
            console.error('Error updating user:', err);
            res.status(500).json({ message: 'Error updating user', error: err });
        });
};
exports.deleteUser = (req, res, next) => {
    const { UserId } = req.params;

    if (!UserId) {
        return res.status(400).json({ message: 'UserId is required' });
    }


    user.findByPk(UserId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }
            return user.destroy();
        })
        .then(() => {
            res.status(200).json({ message: 'user deleted successfully' });
        })
        .catch(err => {
            console.error('Error deleting user:', err);
            res.status(500).json({ message: 'Error deleting user', error: err });
        });
};

exports.editUser = (req, res, next) => {
    const { editId } = req.params;
    const { description, amount } = req.body;

    if (!editId) {
        return res.status(400).json({ message: 'editId is required' });
    }

    user.findByPk(editId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }
            return user.update({ description, amount });
        })
        .then(updatedUser => {
            res.status(200).json({ message: 'user updated successfully', user: updatedUser });
        })
        .catch(err => {
            console.error('Error updating user:', err);
            res.status(500).json({ message: 'Error updating user', error: err });
        });
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const currUser = await user.findOne({ where: { email } });
        if (!currUser) {
            return res.json({ success: false, message: 'Email not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, currUser.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Incorrect password' });
        }

        res.json({ success: true, message: 'Login successful', token: generateAccestoken(currUser.id, currUser.name) });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

