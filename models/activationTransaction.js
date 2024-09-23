const mongoose = require('mongoose');

const activationTransactionSchema = new mongoose.Schema({
  user: { type: String },
  mobileNumber: {type:String},
  email: {type:String},
  activateBy: { type:String },
  package: { type: String, required: true },
  packagePrice: {type: Number},
  wallet: { type:Number}
}, { timestamps: true });

module.exports = mongoose.model('ActivationTransaction', activationTransactionSchema);