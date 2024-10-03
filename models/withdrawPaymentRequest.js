const mongoose = require('mongoose');

const withdrawPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletAddress:{
    type:String,
    required:true
  },
  amount: {
    type: Number,
    required: true,
  },
  referralCode:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus:{
    type:String,
    default: "Processing",
  },
});

module.exports = mongoose.model('WithdrawPaymentRequest', withdrawPaymentSchema);
