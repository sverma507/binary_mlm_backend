const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  utrNumber: {
    type: String,
    required: true,
  },
  paymentChannel: {
    type: String,
    enum: ['Card Number', 'Upi id', 'Qr Code'],
    required: true,
  },
  screenshotUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus:{
    type:String,
    default: "Procesing",
  }
});

module.exports = mongoose.model('Payments', paymentSchema);
