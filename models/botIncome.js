const mongoose = require('mongoose');

const botPurchasedSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    purchasedBy: { type:String }
}, { timestamps: true });

module.exports = mongoose.model('BotPurchased', botPurchasedSchema);