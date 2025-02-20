const expense = require('../models/expense');
const user = require('../models/user');
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

exports.postExpense = async (req, res, next) => {
    const { description, amount, category } = req.body; // add UserId

    const currUser = await user.findByPk(req.user.id)
    const totalAmount = currUser.totalAmount + amount;
    currUser.update({ totalAmount });

    const result = await expense.create({
        description: description,
        amount: amount,
        category: category,
        UserId: req.user.id
    })

    res.status(201).json(result);

};

exports.deleteExpense = async (req, res, next) => {
    const { expenseId } = req.params;

    if (!expenseId) {
        return res.status(400).json({ message: 'expenseId is required' });
    }

    const currExpense = await expense.findByPk(expenseId);

    if (!currExpense) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    if (currExpense.UserId === req.user.id) {
        const currUser = await user.findByPk(req.user.id);

        if (!currUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalAmount = currUser.totalAmount - currExpense.amount;
        await currUser.update({ totalAmount });

        await currExpense.destroy();

        return res.status(200).json({ message: 'Expense deleted successfully' });
    }

    return res.status(403).json({ message: 'Not authorized' });


};

exports.editExpense = async (req, res, next) => {
    const { editId } = req.params;
    const { description, amount, category } = req.body;

    if (!editId) {
        return res.status(400).json({ message: 'editId is required' });
    }

    const currExpense = await expense.findByPk(editId);

    if (!currExpense) {
        return res.status(404).json({ message: 'Expense not found' });
    }

    if (currExpense.UserId === req.user.id) {
        const currUser = await user.findByPk(req.user.id);

        if (!currUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalAmount = currUser.totalAmount - currExpense.amount + amount;
        await currUser.update({ totalAmount });

        await currExpense.update({ description, amount, category });

        return res.status(200).json({ message: 'Expense updated successfully', expense: currExpense });
    }

    return res.status(403).json({ message: 'Not authorized' });

};
