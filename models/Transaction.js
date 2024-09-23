const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  userCode: {type:String},
  type: { type: String, required: true }, // 'deposit', 'withdrawal'
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
