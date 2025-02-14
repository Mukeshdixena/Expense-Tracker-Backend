const expense = require('../models/expense');

exports.getExpense = (req, res, next) => {
    // expense.findAll({ where: { UserId: req.user.id } }) // were UserId = currUser
    req.user.getExpenses()
        .then(expense => {
            res.status(200).json(expense);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Something went wrong!' });
        });
};

exports.postExpense = (req, res, next) => {
    const { description, amount, category } = req.body; // add UserId
    console.log(req.user.id);
    expense.create({
        description: description,
        amount: amount,
        category: category,
        UserId: req.user.id
    })
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Something went wrong!' });
        });
};

exports.deleteExpense = (req, res, next) => {
    const { expenseId } = req.params;

    if (!expenseId) {
        return res.status(400).json({ message: 'expenseId is required' });
    }

    console.log('Received expenseId:', expenseId);

    expense.findByPk(expenseId)
        .then(expense => {
            if (!expense) {
                return res.status(404).json({ message: 'expense not found' });
            }
            if (expense.UserId === req.user.id) {
                return expense.destroy();
            }
            return res.status(404).json({ message: 'not authorized' });
        })
        .then(() => {
            res.status(200).json({ message: 'expense deleted successfully' });
        })
        .catch(err => {
            console.error('Error deleting expense:', err);
            res.status(500).json({ message: 'Error deleting expense', error: err });
        });
};

exports.editExpense = (req, res, next) => {
    const { editId } = req.params;
    const { description, amount, category } = req.body;

    if (!editId) {
        return res.status(400).json({ message: 'editId is required' });
    }

    expense.findByPk(editId)
        .then(expense => {
            if (!expense) {
                return res.status(404).json({ message: 'Expense not found' });
            }
            console.log(expense.UserId, req.user.id)
            if (expense.UserId === req.user.id) {

                return expense.update({ description, amount, category });
            }
            return res.status(404).json({ message: 'not authorized' });
        })
        .then(updatedExpense => {
            res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
        })
        .catch(err => {
            console.error('Error updating expense:', err);
            res.status(500).json({ message: 'Error updating expense', error: err });
        });
};
