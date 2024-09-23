const express = require('express');
const {getQrPaymentTransactions,addQrPaymentRequest, getToken, verifyWalletWithdrawl, WithdrawlWallet, addPayment,withdrawPaymentRequest, withdrawManually, withdrawReject } = require('../controllers/paymentController'); // Ensure this path is correct
const auth = require('../middleware/auth'); 

const router = express.Router();

router.post('/add-payment', auth.protect, addPayment);
router.post('/withdrw-payment-request', auth.protect, withdrawPaymentRequest);
router.post('/add-qr-payment', auth.protect, addQrPaymentRequest);
router.get('/qr-transactions/:id', auth.protect, getQrPaymentTransactions);
router.post('/withdrawl-payment-status',  withdrawManually);
router.post('/withdrawl-payment-reject',  withdrawReject);


module.exports=router;