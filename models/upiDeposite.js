const mongoose = require('mongoose');

const upiDepositeTransactionSchema = new mongoose.Schema({
    userCode: { type: String },
    userId: { type: String },
    client_txn_id: { type: String, required: true, unique: true },
    txnAmount: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerEmail: { type: String, required: true },
    status: { type: String, default: 'processing' },  // 'processing', 'success', 'failed'
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UpiDeposite', upiDepositeTransactionSchema);
