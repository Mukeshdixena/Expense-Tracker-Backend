const Expense = require('../models/expense');
const User = require('../models/user');
const { uploadToS3 } = require('../service/awsS3Service');
const ExpenseDownload = require('../models/expensesDownload');

exports.getExpense = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id });
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

exports.getExpenseFile = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id });

        if (!expenses.length) {
            return res.status(404).json({ message: 'No expenses found', success: false });
        }

        const stringifiedExpenses = JSON.stringify(expenses, null, 2);
        const userId = req.user._id.toString();
        const fileName = `Expense_${userId}_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;

        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        if (!fileUrl) throw new Error("Failed to upload file to S3");

        await ExpenseDownload.create({ fileUrl, userId });

        res.status(200).json({ fileUrl, success: true });
    } catch (error) {
        console.error("Error generating expense file:", error);
        res.status(500).json({ message: 'Something went wrong!', success: false });
    }
};

exports.postExpense = async (req, res, next) => {
    const { description, amount, category } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) throw new Error('User not found');

        const expense = new Expense({
            description,
            amount: parseFloat(amount),
            category,
            userId: req.user._id
        });
        await expense.save();

        user.totalAmount = (user.totalAmount || 0) + parseFloat(amount);
        await user.save();

        res.status(201).json(expense);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: 'Failed to create expense' });
    }
};

exports.deleteExpense = async (req, res, next) => {
    const { expenseId } = req.params;
    if (!expenseId) return res.status(400).json({ message: 'expenseId is required' });

    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        if (expense.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id);
        if (!user) throw new Error('User not found');

        const amountToDeduct = parseFloat(expense.amount || 0);
        user.totalAmount = (user.totalAmount || 0) - amountToDeduct;
        await user.save();

        await expense.deleteOne();

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: 'Failed to delete expense' });
    }
};

exports.editExpense = async (req, res, next) => {
    const { editId } = req.params;
    const { description, amount, category } = req.body;
    if (!editId) return res.status(400).json({ message: 'editId is required' });

    try {
        const expense = await Expense.findById(editId);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        if (expense.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id);
        if (!user) throw new Error('User not found');

        const updatedAmount = amount ? parseFloat(amount) : expense.amount;
        user.totalAmount = (user.totalAmount || 0) - parseFloat(expense.amount) + updatedAmount;
        await user.save();

        expense.description = description;
        expense.amount = updatedAmount;
        expense.category = category;
        await expense.save();

        res.status(200).json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: 'Failed to update expense' });
    }
};
