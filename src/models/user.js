const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+\@.+\..+/, 'Please enter a valid email address'],
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 255,
        },

        isPremiumMember: {
            type: Boolean,
            default: false,
        },

        totalAmount: {
            type: Number,
            required: true,
        },
    }
);

module.exports = mongoose.model('User', userSchema);

