const mongoose = require('mongoose');

const salaryTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  powerLeg: { type: Number },
  otherLeg: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('SalaryTransaction', salaryTransactionSchema);