const ExpenseDownload = require('../models/expensesDownload.js');
const User = require('../models/user');
const sequelize = require('../util/database');

exports.getExpenseDownload = async (req, res, next) => {
    try {
        const expenseDownloads = await ExpenseDownload.findAll({ where: { UserId: req.user.id } });
        res.status(200).json(expenseDownloads);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};


exports.postExpenseDownload = async (req, res, next) => {
    const { FileUrl } = req.body;

    try {
        const currUser = await User.findByPk(req.user.id);
        if (!currUser) return res.status(404).json({ message: 'User not found' });

        const result = await ExpenseDownload.create({
            FileUrl,
            UserId: req.user.id
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating expense download:', error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

exports.deleteExpenseDownload = async (req, res, next) => {
    try {
        const { expenseDownloadId } = req.params;

        if (!expenseDownloadId) {
            return res.status(400).json({ message: 'Download ID is required' });
        }

        // Ensure the user object is available
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const currDownload = await ExpenseDownload.findByPk(expenseDownloadId);

        if (!currDownload) {
            return res.status(404).json({ message: 'Download not found' });
        }

        if (currDownload.UserId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this download' });
        }

        await currDownload.destroy();
        res.status(200).json({ message: 'Download deleted successfully' });

    } catch (error) {
        console.error('Error deleting download:', error);
        res.status(500).json({ message: 'Something went wrong, please try again' });
    }
};

