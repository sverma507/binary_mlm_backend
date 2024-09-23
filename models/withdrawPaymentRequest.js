const mongoose = require('mongoose');

const withdrawPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },

  accountNumber:{
    type:String,
    required:true
  },
  userCode:{type:String},
  ifscCode:{
    type:String,
    required:true
  },
  userName:{
    type:String,
    required:true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus:{
    type:String,
    default: "Procesing",
  },
  orderId: {
    type: String
  },
  type:{ type: String}
});

module.exports = mongoose.model('WithdrawPaymentRequest', withdrawPaymentSchema);
