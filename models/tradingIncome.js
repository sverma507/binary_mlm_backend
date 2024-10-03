// models/Transaction.js
const mongoose = require('mongoose');

const TradingIncomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  amount: { type: Number, required: true },
  tradingWallet: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TradingIncome', TradingIncomeSchema);
