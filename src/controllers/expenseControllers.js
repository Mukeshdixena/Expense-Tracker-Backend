const expense = require('../models/expense');
const user = require('../models/user');
const sequelize = require('../util/database');
const { uploadToS3 } = require('../service/awsS3Service');
const ExpenseDownload = require('../models/expensesDownload.js');

// ✅ Get Expenses
exports.getExpense = async (req, res, next) => {
    try {
        const expenses = await expense.findAll({ where: { UserId: req.user.id } });
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

// ✅ Generate Expense File
exports.getExpenseFile = async (req, res, next) => {
    try {
        const expenses = await expense.findAll({ where: { UserId: req.user.id } });

        if (!expenses.length) {
            return res.status(404).json({ message: 'No expenses found', success: false });
        }

        const stringifiedExpenses = JSON.stringify(expenses, null, 2);
        const userId = req.user.id;
        const fileName = `Expense_${userId}_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;

        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        if (!fileUrl) throw new Error("Failed to upload file to S3");

        console.log({ FileUrl: fileUrl, UserId: userId });
        await ExpenseDownload.create({ fileUrl, UserId: userId });

        res.status(200).json({ fileUrl, success: true });
    } catch (error) {
        console.error("Error generating expense file:", error);
        res.status(500).json({ message: 'Something went wrong!', success: false });
    }
};

// ✅ Create Expense with Transaction
exports.postExpense = async (req, res, next) => {
    const { description, amount, category } = req.body;
    const t = await sequelize.transaction();

    try {
        const currUser = await user.findByPk(req.user.id, { transaction: t });
        if (!currUser) throw new Error('User not found');

        const totalAmount = parseFloat(currUser.totalAmount || 0) + parseFloat(amount);
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

// ✅ Delete Expense with Transaction
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

        const amountToDeduct = parseFloat(currExpense.amount || 0);
        await currUser.update({ totalAmount: currUser.totalAmount - amountToDeduct }, { transaction: t });

        await currExpense.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: 'Transaction failed' });
    }
};

// ✅ Edit Expense with Transaction
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

        const updatedAmount = amount ? parseFloat(amount) : currExpense.amount;
        const totalAmount = parseFloat(currUser.totalAmount || 0) - parseFloat(currExpense.amount) + updatedAmount;
        await currUser.update({ totalAmount }, { transaction: t });

        await currExpense.update(
            { description, amount: updatedAmount, category },
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
