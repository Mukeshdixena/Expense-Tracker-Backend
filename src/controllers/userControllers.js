const User = require('../models/user');
const Password = require('../models/passwords');
const expense = require('../models/expense');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function generateAccestoken(id, name) {
    return jwt.sign({ UserId: id, name: name }, process.env.PRIVET_KEY);
}

exports.getUser = async (req, res, next) => {
    const thisUsers = await User.find();
    if (!thisUsers) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUsers);
};

exports.getLeaderBoad = async (req, res) => {
    try {
        const leaderboard = await expense.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    username: "$user.username",
                    isPremiumMember: "$user.isPremiumMember",
                    totalAmount: 1
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserById = async (req, res, next) => {
    const thisUser = await User.findById(req.user.id);
    if (!thisUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUser);
};

exports.getUserTotalAmount = async (req, res, next) => {
    const thisUser = await User.findById(req.user.id);
    if (!thisUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(thisUser);
};

exports.postUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            totalAmount: 0,
            password: hashedPassword
        });
        try {

            await Password.create({ hashedPassword: hashedPassword, userId: newUser._id });
        } catch (err) {
            console.log(err);
        }


        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.postUserPass = async (req, res, next) => {
    try {
        const { emailId, newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const currUser = await User.findOne({ email: emailId });

        if (!currUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currUserPass = await Password.find({ UserId: currUser._id });

        for (const currPass of currUserPass) {
            const isMatch = await bcrypt.compare(newPassword, currPass.hashedPassword);
            if (isMatch) {
                return res.json({ success: false, message: 'This password already exists, please choose another' });
            }
        }

        await Password.create({ hashedPassword, userId: currUser._id });
        await User.findByIdAndUpdate(currUser._id, { password: hashedPassword });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.postPremium = async (req, res, next) => {
    const { isPremiumMember } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { isPremiumMember },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user', error: err });
    }
};

exports.deleteUser = async (req, res, next) => {
    const { UserId } = req.params;

    if (!UserId) {
        return res.status(400).json({ message: 'UserId is required' });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(UserId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user', error: err });
    }
};

exports.editUser = async (req, res, next) => {
    const { editId } = req.params;
    const { description, amount } = req.body;

    if (!editId) {
        return res.status(400).json({ message: 'editId is required' });
    }

    try {
        const updatedUser = await user.findByIdAndUpdate(
            editId,
            { description, amount },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user', error: err });
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const currUser = await User.findOne({ email });

        if (!currUser) {
            return res.json({ success: false, message: 'Email not found' });
        }

        const isMatch = await bcrypt.compare(password, currUser.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Incorrect password' });
        }

        res.json({
            success: true,
            message: 'Login successful',
            token: generateAccestoken(currUser._id, currUser.username)
        });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
