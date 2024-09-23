const mongoose = require('mongoose');

const qrpaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userCode:{
    type:String,
    required:true
  },
  amount: {
    type: Number,
    required: true,
  },
  utrNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus:{
    type:String,
    default: "Processing",
  }
});

module.exports = mongoose.model('QrPayments', qrpaymentSchema);
