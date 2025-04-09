const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema(
    {
        hashedPassword: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'passwords',
    }
);

module.exports = mongoose.model('Password', passwordSchema);
