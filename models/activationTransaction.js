const mongoose = require('mongoose');

const activationTransactionSchema = new mongoose.Schema({
  user: { type: String },
  referralCode: {type:String},
  activateBy: { type:String },
}, { timestamps: true });

module.exports = mongoose.model('ActivationTransaction', activationTransactionSchema);