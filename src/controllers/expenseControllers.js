const expense = require('../models/expense');
const user = require('../models/user');
const sequelize = require('../util/database');
const { uploadToS3 } = require('../service/awsS3Service');



exports.getExpense = async (req, res, next) => {
    try {
        const expenses = await req.user.getExpenses();
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.getExpenseFile = async (req, res, next) => {
    try {
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses, null, 2);
        const userId = req.user.id;
        const fileName = `Expense_${userId}_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;

        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);

        res.status(200).json({ fileUrl, success: true });
    } catch (error) {
        console.error("Error generating expense file:", error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.postExpense = async (req, res, next) => {
    const { description, amount, category } = req.body;
    const t = await sequelize.transaction();

    try {
        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = parseFloat(currUser.totalAmount) + parseFloat(amount);
        await currUser.update({ totalAmount }, { transaction: t });

        const result = await expense.create({
            description,
            amount: parseFloat(amount),
            category,
            UserId: req.user.id
        }, { transaction: t });

        await t.commit();
        res.status(201).json(result);
    } catch (error) {
        await t.rollback();
        console.error("Error creating expense:", error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

exports.deleteExpense = async (req, res, next) => {
    const { expenseId } = req.params;
    if (!expenseId) return res.status(400).json({ message: 'expenseId is required' });

    const t = await sequelize.transaction();

    try {
        const currExpense = await expense.findByPk(expenseId, { transaction: t });
        if (!currExpense) return res.status(404).json({ message: 'Expense not found' });

        if (currExpense.UserId !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = parseFloat(currUser.totalAmount) - parseFloat(currExpense.amount);
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

exports.editExpense = async (req, res, next) => {
    const { editId } = req.params;
    const { description, amount, category } = req.body;
    if (!editId) return res.status(400).json({ message: 'editId is required' });

    const t = await sequelize.transaction();

    try {
        const currExpense = await expense.findByPk(editId, { transaction: t });
        if (!currExpense) return res.status(404).json({ message: 'Expense not found' });

        if (currExpense.UserId !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = parseFloat(currUser.totalAmount) - parseFloat(currExpense.amount) + parseFloat(amount);
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.update(
            { description, amount: parseFloat(amount), category },
            { transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: 'Expense updated successfully', expense: currExpense });
    } catch (error) {
        await t.rollback();
        console.error("Error updating expense:", error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};
