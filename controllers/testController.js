const { ethers } = require("ethers");
const User = require("../models/User");
// const mongoose = require("mongoose");

// const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
// const walletPrivateKey = "b7125d0db27446e0a75d89cede55d538c6b6470951d2e82540d80c427fe43faf"; // Replace with your wallet's private key
// const wallet = new ethers.Wallet(walletPrivateKey, provider);

// // const contractAddress = "0xF7BdBDCf04F72Df51Bf3424EAF33BB4965797eE2"; // Replace with your contract address
// const contractAddress = "0x5805BDD1D1f1363f4707BE90E31C49Fa10F431bc"; // Replace with your contract address
// const abi = [
//     {
//         "inputs": [],
//         "name": "purchaseBull",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     }
// ];
// const contract = new ethers.Contract(contractAddress, abi, wallet);

// const usdtTokenAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT contract address
// const usdtTokenAbi = [
//     {
//         "constant": true,
//         "inputs": [
//             {
//                 "name": "owner",
//                 "type": "address"
//             },
//             {
//                 "name": "spender",
//                 "type": "address"
//             }
//         ],
//         "name": "allowance",
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "payable": false,
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "name": "spender",
//                 "type": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256"
//             }
//         ],
//         "name": "approve",
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "payable": false,
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
// ];

// const usdtToken = new ethers.Contract(usdtTokenAddress, usdtTokenAbi, wallet);

// exports.PurchaseBull = async (req, res) => {
//     const userId = req.params.id;
//     const priceInUSD = 1;
//     const amountInTokens = priceInUSD * Math.pow(10, 18); // This should match the USDT price

//     try {
//         const user = await User.findById(userId);
//         if (!user || !user.walletAddress) {
//             return res.status(404).json({ error: "User not found or wallet address missing." });
//         }

//         const buyerAddress = user.walletAddress;
//         const amountBigNumber = ethers.utils.parseUnits(priceInUSD.toString(), 18);

//         // Check allowance
//         const allowance = await usdtToken.allowance(buyerAddress, contractAddress);
//         if (allowance.lt(amountBigNumber)) {
//             console.log("Insufficient allowance. Prompting user to approve...");
//             const approvalSuccess = await handleApprovalProcess(buyerAddress, amountBigNumber);
//             if (!approvalSuccess) {
//                 return res.status(400).json({ error: "Approval failed or timeout occurred." });
//             }
//         }

//         const gasLimit = await contract.estimateGas.purchaseBull();

//         // Execute the purchase
//         const tx = await contract.purchaseBull({
//             gasLimit: gasLimit,
//             nonce: await wallet.getTransactionCount(),
//         });

//         console.log("Transaction sent: ", tx.hash);
//         await tx.wait();
//         console.log("Transaction confirmed in block: ", tx.blockNumber);

//         return res.status(200).json({ message: "Transaction successful", transactionHash: tx.hash });
//     } catch (error) {
//         console.error("Error occurred:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

// // Handle Approval Process
// const handleApprovalProcess = async (buyerAddress, amountBigNumber) => {
//     return new Promise(async (resolve, reject) => {
//         // Create a new wallet instance with the user's private key
//         const userWallet = new ethers.Wallet(userPrivateKey, provider); // Replace with the user's private key

//         try {
//             // Send approval request from the user's wallet
//             const approveTx = await usdtToken.connect(userWallet).approve(contractAddress, amountBigNumber);
//             console.log("Approval transaction sent: ", approveTx.hash);

//             // Set a timeout for 1 minute (60000 ms)
//             const timeout = setTimeout(() => {
//                 console.log("Approval timed out.");
//                 reject(new Error("User did not approve in time"));
//             }, 60000);

//             // Wait for the approval to be confirmed
//             const receipt = await approveTx.wait();
//             console.log("Approval confirmed in block: ", receipt.blockNumber);

//             // Clear the timeout after successful approval
//             clearTimeout(timeout);
//             resolve(true);
//         } catch (error) {
//             console.error("Approval failed: ", error);
//             reject(false);
//         }
//     });
// };












// purchaseController.js
// const User = require('./models/User'); // Adjust the import path according to your project structure



// Function to handle bull purchases
exports.PurchaseBull = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const buyerAddress = user.walletAddress;

        // Here, create the necessary data for approval
        const approvalData = {
            contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
            amount: ethers.utils.parseUnits('60', 6) // Assuming 6 decimals for USDT
        };

        res.json({ message: "Approval requested. Please approve the transaction.", approvalData });
    } catch (error) {
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};
