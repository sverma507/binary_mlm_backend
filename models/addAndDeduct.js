const mongoose = require('mongoose');

const addDeductTransactionSchema = new mongoose.Schema({
  user: { type: String },
  userCode: { type: String },
  amount: { type: Number, default:0},
  type: { type:String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AddTransaction', addDeductTransactionSchema);