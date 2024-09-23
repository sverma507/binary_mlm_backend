const express = require('express');
const axios = require('axios');
const WithdrawPaymentRequest = require('../models/withdrawPaymentRequest');
const API_KEY = "LI1V5Z2LhFGvf10mGmjK2l6O12yJNwHBrmv4SWyh5EsqtMUojG83ol24Sxrf";
const CLIENT_ID = "NDky";
const cron = require('node-cron');

const router = express.Router();

// Payout API Endpoint
router.post('/payout-request', async (req, res) => {
    const {amount,transactionId}=req.body;
    const newAmount=Number(amount)-(Number(amount)*5)/100
    const transactionData = await WithdrawPaymentRequest.findById(transactionId);
    const payload = {
        Apikey: API_KEY,
        client_id: CLIENT_ID,
        amount: newAmount,
        beneficiaryIFSC: req.body.beneficiaryIFSC,
        beneficiaryAccount: req.body.beneficiaryAccount,
        beneficiaryName: req.body.beneficiaryName,
        beneficiaryAddress: req.body.beneficiaryAddress,
        paymentMode: req.body.paymentMode,
        remarks: req.body.remarks,
        transfermode: 'bank'
    };

    console.log("details ==>",payload);
    

    try {

        const response = await axios.post('https://easywallet.ind.in/api/payout', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('request response ==>',response?.data);
        transactionData.orderId = response?.data?.data?.data?.orderId;
        transactionData.type = "API"
        console.log('dataWithdrawl ==>',transactionData.orderId);
        
        await transactionData.save();
        res.json(response?.data);
    } catch (error) {
        console.log('reqeust error ==>',error);
        const errorMessage = error.message || "Payment failed. Please try again.";
        res.status(500).json({ error: errorMessage });
    }
});


// const PayoutStatus = async (req,res) => {
    

//     const transactionData = await WithdrawPaymentRequest.find()

//     for(let i=0;i<transactionData.length;i++){
//         console.log('hllo ========>');
        
//         console.log(transactionData[i].orderId);
        
//         if(transactionData[i].orderId){
//             const payload = {
//                 Apikey: API_KEY,
//                 client_id: CLIENT_ID,
//                 amount: transactionData[i].amount,
//                 orderid: transactionData[i].orderId,
//             };
        
//             try {
//                 const response = await axios.post('https://easywallet.ind.in/api/payout/status', payload, {
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 });
//                 console.log('status response ==>',response);
//                 transactionData.paymentStatus = response.data.data.data.status;
//                 console.log('abc ==>',response.data.data.data.status);
                
//                 await transactionData[i].save();
//                 res.status(200).send(response.data);
//             } catch (error) {
//                 console.log('status error ==>',error);
//                 res.status(500).json({ error: 'Failed to retrieve status', details: error.response?.data });
//             }
//         }
        
//     }
   
// }


const PayoutStatus = async (req,res) => {
    try {
        const transactionData = await WithdrawPaymentRequest.find();
        // console.log('Transactions found:', transactionData); // Check if transactionData is being retrieved

        if (!transactionData || transactionData.length === 0) {
            console.log('No transactions found');
            return; // Exit the function if there are no transactions
        }

        for (let i = 0; i < transactionData.length; i++) {
            const currentTransaction = transactionData[i];
            // console.log('Processing transaction for orderId:', currentTransaction.orderId);

            // Check if orderId exists and is not empty
            if (currentTransaction.orderId && currentTransaction.orderId.trim() !== '') {
                const payload = {
                    Apikey: API_KEY,
                    client_id: CLIENT_ID,
                    amount: currentTransaction.amount,
                    orderid: currentTransaction.orderId,
                };

                try {
                    const response = await axios.post('https://easywallet.ind.in/api/payout/status', payload, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    // console.log('Received API response:', response.data);

                    // Correctly accessing the 'status' field from the response structure
                    const status = response?.data?.data?.data?.status;

                    if (status) {
                        console.log('Status retrieved:', status);
                        currentTransaction.paymentStatus = status; // Update the payment status
                        await currentTransaction.save(); // Save the transaction data
                        // console.log('Transaction updated:', currentTransaction);
                        // res.send('Updated')
                    } else {
                        console.log('Status not found in API response for orderId:', currentTransaction.orderId);
                    }
                } catch (error) {
                    console.error('Error while retrieving status:', error.message || error);
                }
            } else {
                console.log(`Skipping transaction: Order ID is missing or empty for transaction ${i + 1}`);
            }
        }
    } catch (error) {
        console.error('Database error:', error);
    }
};








// cron.schedule('* * * * *', () => {
//     console.log('Running Withdrawal status update...');

//     PayoutStatus();  
// });



// Payout Status Endpoint
// router.post('/payout-status', PayoutStatus);

// Get Balance Endpoint
router.post('/payout-balance', async (req, res) => {
    const payload = {
        Apikey: API_KEY,
        client_id: CLIENT_ID
    };

    try {
        const response = await axios.post('https://easywallet.ind.in/api/payout/balance', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('balance response ==>',response);
        res.json(response.data);
    } catch (error) {
        console.log('balance error ==>',error);
        res.status(500).json({ error: 'Failed to retrieve balance', details: error.response?.data });
    }
});


module.exports = router;