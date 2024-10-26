const { ethers } = require("ethers");
const User = require("../models/User");

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




 // Path to your user model

// Controller to add tradingWallet field to all users
// exports.addTradingWalletToAllUsers = async (req, res) => {
//     console.log("called new key in user ===========================");

//     try {
//         const totalUsers = await User.countDocuments();
//         console.log(`Total users in the database: ${totalUsers}`);

//         const usersToUpdate = await User.find({ $or: [{ tradingWallet: { $exists: false } }, { tradingWallet: null }] });
//         console.log(`Users to update: ${usersToUpdate.length}`); // Log the number of users that meet the criteria

//         const result = await User.updateMany(
//             { $or: [{ tradingWallet: { $exists: false } }, { tradingWallet: null }] },
//             { $set: { tradingWallet: 0 } }
//         );

//         // Send success response with the number of modified users
//         res.status(200).json({
//             success: true,
//             message: `${result.modifiedCount} users updated with tradingWallet field.`,
//         });
//     } catch (error) {
//         console.error("Error adding tradingWallet to all users:", error);
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while updating users.",
//             error: error.message,
//         });
//     }
// };


exports.addTradingWalletToAllUsers = async (req, res) => {
    console.log("called new key in user ===========================");

    try {
        // Log the current count of users
        const totalUsers = await User.find();
        console.log(`Total users in the database: ${totalUsers}`);

        // Find users who either don't have the field or have it set to null

        for(let i=0;i<totalUsers.length;i++){
            totalUsers[i].tradingWallet = 0;

          await  totalUsers[i].save()
        }

        // Send success response with the number of modified users
        res.status(200).json({
            success: true,
            message: `users updated with tradingWallet field.`,
        });
    } catch (error) {
        console.error("Error adding tradingWallet to all users:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating users.",
            error: error.message,
        });
    }
};
