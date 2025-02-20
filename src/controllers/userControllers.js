const user = require('../models/user');
const expense = require('../models/expense');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
function generateAccestoken(id, name) {
    return jwt.sign({ UserId: id, name: name }, "privetekey")
}
exports.getUser = async (req, res, next) => {
    const thisUsers = await user.findAll()
    if (!thisUsers) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUsers);
};
exports.getLeaderBoad = async (req, res, next) => {
    const users = await user.findAll();
    const leaderboard = await Promise.all(users.map(async (user) => {

        const expenses = await user.getExpenses();
        const totalAmount = expenses.reduce((total, item) => total + item.amount, 0);
        return {
            user,
            totalAmount
        };
    }));

    leaderboard.sort((a, b) => b.totalAmount - a.totalAmount);
    res.status(200).json(leaderboard);

};
exports.getUserById = async (req, res, next) => {
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
            password: hashedPassword
        });

        res.status(201).json(newUser);
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
