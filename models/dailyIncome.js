const mongoose = require('mongoose');

const dailyIncomeTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  package: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DailyIncomeTransaction', dailyIncomeTransactionSchema);