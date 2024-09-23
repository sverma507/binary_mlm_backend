// app.js
const express = require('express');
const axios = require('axios');
const upiDeposite = require('../models/upiDeposite');
const User = require('../models/User');
const router = express.Router();
const cron = require('node-cron');


const apiKey = "59021cea-67d9-498b-9928-e2a03f686ea0"; // Your API Token from UPI Gateway

// Initiate Payment
router.post('/initiate-payment', async (req, res) => {
    try {
        const { txnAmount, customerName, customerMobile, customerEmail, userId } = req.body;
        console.log("req body ==>",req.body);
        
        const user = await User.findById(userId);
        const client_txn_id = Math.floor(100000 + Math.random() * 900000).toString(); // Generating random transaction ID
        console.log('user ==>',user);
        
        const postData = {
            key: apiKey,
            client_txn_id,
            amount: txnAmount,
            p_info: "product_name",
            customer_name: customerName,
            customer_email: customerEmail,
            customer_mobile: customerMobile,
            redirect_url: "https://hypedrinks.pro/", // Update this URL to your actual redirect page
            udf1: "extradata",
            udf2: "extradata",
            udf3: "extradata"
        };

        const response = await axios.post('https://api.ekqr.in/api/create_order', postData, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data) {
            // Save the transaction in the database
            console.log('response data ==>',response.data);
            
            const newTransaction = new upiDeposite({
                userId,
                userCode:user.referralCode,
                client_txn_id,
                txnAmount,
                customerName: "abc",
                customerMobile:user.mobileNumber,
                customerEmail: user.email,
                status: 'processing'
            });

            await newTransaction.save();

            res.json({ paymentData: response.data.data,client_txn_id });
        } else {
            res.status(400).json({ message: response.data.msg });
        }
    } catch (error) {
        console.error("Error initiating payment", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/transactions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await upiDeposite.find({ userId:userId }).sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions", error);
        res.status(500).json({ message: "Server Error" });
    }
});


router.get('/all-transactions', async (req, res) => {
    try {
        const { userId } = req.query;
        const transactions = await upiDeposite.find();

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions", error);
        res.status(500).json({ message: "Server Error" });
    }
});



const updateTransactions = async () => {
    try {
        // Fetch transactions with status "scanning"
        const transactions = await upiDeposite.find({ status: "scanning" });
        // console.log("transactions........ =====>", transactions);

        // Current time
        const currentTime = new Date();

        // Loop through each transaction
        for (let transaction of transactions) {
            // Calculate the time difference in minutes
            const timeDifference = (currentTime - new Date(transaction.createdAt)) / (1000 * 60); // Convert milliseconds to minutes

            // If time difference is greater than 5 minutes, delete the transaction
            if (timeDifference > 5) {
                await upiDeposite.findByIdAndDelete(transaction._id);
                console.log(`Deleted transaction with id ${transaction._id} as it was older than 5 minutes.`);
            }
        }

        // Optionally, you can return a success message or updated transactions list
        // res.json({ message: "Old transactions deleted", transactions });

    } catch (error) {
        console.error("Error fetching transactions", error);
        // res.status(500).json({ message: "Server Error" });
    }
}


// Handle Callback after Payment
router.post('/payment-callback', (req, res) => {
    const {
        id, customer_vpa, amount, client_txn_id, customer_name,
        customer_email, customer_mobile, p_info, upi_txn_id, status,
        remark, udf1, udf2, udf3, redirect_url, txnAt, createdAt
    } = req.body;

    // Process after payment
    if (status === 'success') {
        // Transaction Successful
        console.log("Transaction Successful");
        // Handle successful transaction logic here
    } else if (status === 'failure') {
        // Transaction Failed
        console.log("Transaction Failed");
        // Handle failed transaction logic here
    }

    res.send("Callback received");
});

// Check Payment Status
router.get('/check-status', async (req, res) => {
    try {
        const { client_txn_id,userId,amount } = req.query;

        const postData = {
            key: apiKey,
            client_txn_id,
            txn_date: new Date().toLocaleDateString('en-GB').split('/').join('-')
        };
         
         const user = await User.findById(userId);
        const response = await axios.post('https://api.ekqr.in/api/check_order_status', postData, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.status === true) {
            const updatedTransaction = await upiDeposite.findOneAndUpdate(
                { client_txn_id },
                { status: response.data.data.status, updatedAt: new Date() },
                { new: true }   
            );

            // console.log('hello');
            if(response.data.data.status === "success"){
                console.log('world');
                
                user.rechargeWallet += Number(amount);
                user.save();
            }
             
            console.log('status ==>',{ status: updatedTransaction.status, data: response.data.data });
            updatedTransaction.save();
            res.json({ status: updatedTransaction.status, data: response.data.data });
        } else {
            res.status(400).json({ message: response.data.msg });
        }
    } catch (error) {
        console.error("Error checking payment status", error);
        res.status(500).json({ message: "Server Error" });
    }
});


// cron.schedule('*/5 * * * *', () => {
//     console.log('Running Withdrawal status update...');

//     updateTransactions();  
// });

module.exports = router;
