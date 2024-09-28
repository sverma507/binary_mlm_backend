const mongoose = require('mongoose');

const botIncome = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    fromUser: { type: String },
    level: { type: Number},
    package: { type: String },
    netIncome: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('BotIncome', botIncome);