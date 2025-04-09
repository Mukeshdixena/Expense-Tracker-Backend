const mongoose = require('mongoose');

const expenseDownloadSchema = new mongoose.Schema({
    FileUrl: {
        type: String,
        required: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExpenseDownload', expenseDownloadSchema);
