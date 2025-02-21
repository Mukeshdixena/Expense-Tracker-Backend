const expense = require('../models/expense');
const user = require('../models/user');
const sequelize = require('../util/database');

exports.getExpense = async (req, res, next) => {
    try {
        const expenses = await req.user.getExpenses();
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.postExpense = async (req, res, next) => {
    const { description, amount, category } = req.body;
    const t = await sequelize.transaction();

    try {
        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = currUser.totalAmount + amount;
        await currUser.update({ totalAmount }, { transaction: t });

        const result = await expense.create({
            description,
            amount,
            category,
            UserId: req.user.id
        }, { transaction: t });

        await t.commit();
        res.status(201).json(result);
    } catch (error) {
        await t.rollback();
        console.error(error);
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

        const totalAmount = currUser.totalAmount - currExpense.amount;
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error(error);
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

        const totalAmount = currUser.totalAmount - currExpense.amount + amount;
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.update({ description, amount, category }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Expense updated successfully', expense: currExpense });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};
