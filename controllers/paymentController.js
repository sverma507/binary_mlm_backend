const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const Package = require('../models/Package');
const Payments =require('../models/payment')
const Transaction = require('../models/Transaction');
const WithdrawPaymentRequest =require('../models/withdrawPaymentRequest')
const QrPaymentRequest = require('../models/qrPayment'); 
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.getQrPaymentTransactions = async (req,res) =>{
  try {
    const userId = req.params.id; // Get userId from URL parameters

    // Fetch transactions from the database by userId
    const transactions = await QrPaymentRequest.find({ userId });

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No transactions found for this user.',
        data: [],
      });
    }

    // If transactions are found, send them in the response
    return res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully.',
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
      error: error.message,
    });
  }
}


exports.addQrPaymentRequest = async (req, res) => {
  try {
    const { userId, userCode, amount, utrNumber } = req.body;

    const newPaymentRequest = new QrPaymentRequest({
      userId,
      userCode,
      amount,
      utrNumber,
    });

    const savedPaymentRequest = await newPaymentRequest.save();

    res.status(201).json({
      success: true,
      message: 'QR Payment requested successfully!',
      data: savedPaymentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to request QR Payment ',
      error: error.message,
    });
  }
};



exports.withdrawManually = async (req, res) => {
  try {

    const {transactionId} = req.body;

    const transactionData = await WithdrawPaymentRequest.findById(transactionId);
     
    transactionData.paymentStatus = 'Completed'
    transactionData.type = "Manually";
    

    await transactionData.save();

    // Send success response
    res.status(200).json({ message: 'Withdrawal request status updated successfully.' });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({ error: 'There was an issue processing your request. Please try again.' });
  }
};


exports.withdrawReject = async (req, res) => {
  try {

    const {transactionId} = req.body;

    const transactionData = await WithdrawPaymentRequest.findById(transactionId);
     
    transactionData.paymentStatus = 'Rejected'
    

    await transactionData.save();

    // Send success response
    res.status(200).json({ message: 'Withdrawals Rejected.' });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({ error: 'There was an issue processing your request. Please try again.' });
  }
};


exports.withdrawPaymentRequest = async (req, res) => {
  try {
    const { accountNumber, ifscCode, userName, amount, userId } = req.body;

    console.log("withdraw-request=>", req.body);

    // Validate required fields
    
    if (!accountNumber || !ifscCode || !userName || !amount || !userId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

   

    // Convert amount to number and validate
    const withdrawalAmount = Number(amount);

    // Retrieve the user's wallet balance
    const user = await User.findOne({_id:userId});
    const referredUsers=await User.find({referredBy:user.referralCode})
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the user has sufficient balance
   if(user.active){
    if(user.withdrawlCount == 1){
      return res.status(400).json({ error: 'You can only withdrawl only once in a day' });
    }

    let status = false;
    let count = 0;

    for(const referredUser of referredUsers){
        if(referredUser.active){
          count++;
        }

        if(count == 2){
          status = true;
          break;
        }
    }

    if(!status){

      return res.status(400).json({ error: 'Atleast  two users have to be activated with your referral code ' });

    }
    if (withdrawalAmount > user.wallet) {
      return res.status(400).json({ error: 'Insufficient balance in wallet.' });
    }else if(withdrawalAmount < 200){
      return res.status(400).json({ error: 'Minimum withdrawal amount is 200.' });
    }
   
   if(!(amount%100==0)){
    return res.status(400).json({ error: 'Enter Amount in Multipe of 100!' });
     }

    user.wallet -= withdrawalAmount;
    user.withdrawlCount += 1;
    await user.save();
    // Create a new withdraw payment request
    const withdrawRequest = new WithdrawPaymentRequest({
      userId,
      userCode:user.referralCode,
      amount: withdrawalAmount,
      accountNumber,
      ifscCode,
      userName,
    });

    // Save the withdraw request to the database
    await withdrawRequest.save();

    // Send success response
    res.status(200).json({ message: 'Withdrawal request processed successfully.' });
  }else{
    return res.status(400).json({ error: "Please Activate Your Account First" });
 }
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({ error: 'There was an issue processing your request. Please try again.' });
  }
};


exports.addPayment = async (req, res) => {
  try {
    const { amount, utrNumber, paymentChannel, userId } = req.body;
    const screenshot = req.files?.screenshot; 
    if (!amount || parseFloat(amount) < 100) {
      return res.status(400).json({ error: 'The minimum amount of recharge is 100 Rs.' });
    }
    if (!utrNumber) {
      return res.status(400).json({ error: 'UTR number is required.' });
    }
    if (!screenshot) {
      return res.status(400).json({ error: 'Payment screenshot is required.' });
    }

    // Move the file to a temporary location
    const filePath = screenshot.tempFilePath;

    // Upload the file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, { folder: 'payments' });

    // Create a new payment record
    const payment = new Payments({
      amount,
      utrNumber,
      paymentChannel,
      userId,
      screenshotUrl: uploadResult.secure_url,
    });

    // Save the payment record to the database
    await payment.save();

    // Send success response
    res.status(200).json({ message: 'Payment added successfully' });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'There was an issue processing your request. Please try again.' });
  }
};
