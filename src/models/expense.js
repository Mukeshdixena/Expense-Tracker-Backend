const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true, collection: 'expenses' }
);

module.exports = mongoose.model('Expense', expenseSchema);
