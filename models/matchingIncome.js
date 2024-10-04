const mongoose = require('mongoose');

const matchingIncome = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referralCode: { type: String},
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MatchingIncome', matchingIncome);