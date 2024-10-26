const mongoose = require('mongoose');

const botLevelIncomeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromUser: { type: String},
    level: { type:Number },
    percentage: { type:Number },
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('BotLevelIncome', botLevelIncomeSchema);