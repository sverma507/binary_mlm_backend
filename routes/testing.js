const Transaction = require('../models/Transaction');
const User = require('../models/User');
const withdrawPaymentRequest = require('../models/withdrawPaymentRequest');
const GameIncomeTransaction = require("../models/gameIncome");


const addGameProfitToUsers = async (req, res) => {
  try {
    const userIdToDelete = '66ec20469e3c88b47389118d'; // The userId you want to delete transactions for
    
    // Delete all game income transactions for the specific userId
    const deleteResult = await User.deleteMany({ referredBy: "EM104257" });

    // Send a success response with the number of deleted transactions
    res.status(200).json({
      message: `Successfully deleted ${deleteResult.deletedCount} game income transactions for user ${userIdToDelete}`,
      transactionsDeleted: deleteResult.deletedCount
    });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).json({ message: "An error occurred while deleting transactions", error });
  }
  };

  

  module.exports = {
    addGameProfitToUsers
  };