const mongoose = require('mongoose');

const tradingTransactionSchema = new mongoose.Schema({
  user: { type: String },
  amount: { type: Number, default:0},
  fromAmount: { type:Number, default:0 }
}, { timestamps: true });

module.exports = mongoose.model('TradingTransaction', tradingTransactionSchema);