const User = require("../models/User");
const Package = require("../models/Package");
const jwt = require("jsonwebtoken");
const AdminCredentials = require("../models/Admin/Admin");
const JWT_SECRET = process.env.JWT_SECRET;
const Product = require("../models/addPackage");
const WithdrawPaymentRequest = require("../models/withdrawPaymentRequest");
const ActivationTransaction = require("../models/activationTransaction");
const AddTransaction = require("../models/addAndDeduct");
const BotLevelIncome = require("../models/botLevelIncome");
const BotPurchased = require("../models/botIncome");
const TradingIncome = require("../models/tradingIncome");
const MatchingIncome = require("../models/matchingIncome");
const Gift = require("../models/giftPopup");
const TradingIncomePercent = require("../models/tradingIncomePercent");
const {CalculateRankSalary} = require("./ranksalary")
const {DistributeRankSalary} = require("./ranksalary")
// Import your TradingIncomePercent model

// Create or Update Trading Income Percent
exports.createTradingIncomePercent = async (req, res) => {
  const { percent } = req.body; // Capture the percent from the request body
  const { id } = req.params; // Capture the ID if provided for updates

  // Validate input
  if (percent === undefined) {
    return res
      .status(400)
      .json({ message: "Percent is required and must be a number" });
  }

  try {
    let tradingIncome;

    if (id) {
      // If ID is provided, update the existing Trading Income Percent
      tradingIncome = await TradingIncomePercent.findByIdAndUpdate(
        id, // The ID of the Trading Income Percent to update
        { percent }, // The updated value
        { new: true, runValidators: true } // Return the updated document
      );

      if (!tradingIncome) {
        return res
          .status(404)
          .json({ message: "Trading income percent not found" });
      }

      return res.status(200).json({
        message: "Trading income percent updated successfully",
        tradingIncome,
      });
    } else {
      // If no ID is provided, create a new Trading Income Percent
      const newTradingIncomePercent = new TradingIncomePercent({
        percent,
      });

      const savedTradingIncomePercent = await newTradingIncomePercent.save();

      return res.status(201).json({
        message: "Trading income percent created successfully",
        tradingIncome: savedTradingIncomePercent,
      });
    }
  } catch (error) {
    console.error("Error creating or updating trading income percent:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

exports.getTradingIncomePercent = async (req, res) => {
  try {
    // Fetch all trading income percent records from the database
    const tradingIncomePercents = await TradingIncomePercent.find();

    if (!tradingIncomePercents.length) {
      return res
        .status(404)
        .json({ message: "No trading income percent records found." });
    }

    return res.status(200).json({
      message: "Trading income percents retrieved successfully.",
      data: tradingIncomePercents,
    });
  } catch (error) {
    console.error("Error retrieving trading income percents:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

exports.GetGiftPopup = async (req, res) => {
  try {
    const result = await Gift.find();

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No PopUp Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during  getting Popup", error);
    return res.status(500).json({
      success: false,
      message: "Error during  getting Popup",
    });
  }
};

// Create or Update Gift Popup
exports.GiftPopup = async (req, res) => {
  const { title, description, price } = req.body;
  const { id } = req.params; // Capture the ID if provided for updates

  // Validate inputs
  if (!title || !description || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let gift;

    if (id) {
      // If ID is provided, update the existing gift
      gift = await Gift.findByIdAndUpdate(
        id, // The ID of the gift to update
        { title, description, price }, // The updated values
        { new: true, runValidators: true } // Return the updated document
      );

      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }

      return res.status(200).json({
        message: "Gift updated successfully",
        gift,
      });
    } else {
      // If no ID is provided, create a new gift
      const newGift = new Gift({
        title,
        description,
        price,
      });

      const savedGift = await newGift.save();

      return res.status(201).json({
        message: "Gift created successfully",
        gift: savedGift,
      });
    }
  } catch (error) {
    console.error("Error creating or updating gift:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

exports.getLevelIncome = async (req, res) => {
  console.log("helo================================");
  const userId = req.params.userId;
  console.log("bolt level -id =>", userId);
  try {
    const result = await BotLevelIncome.find();

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trading income found for the specified user.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during retrieving trading income:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching bot level income. Please try again later.",
    });
  }
};

exports.getMatchingIncome = async (req, res) => {
  console.log("helo================================");
  const userId = req.params.userId;
  console.log("bolt level -id =>", userId);
  try {
    const result = await MatchingIncome.find();

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trading income found for the specified user.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during retrieving trading income:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching bot level income. Please try again later.",
    });
  }
};

exports.getAllTradingTransactions = async (req, res) => {
  try {
    // Fetch all transactions, populate user details if needed
    const transactions = await TradingIncome.find(); // Modify as per the fields you want to show

    // Respond with the transactions
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

exports.update_withdrawl_request_status = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  try {
    const request = await WithdrawRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }

    // Update the status
    request.paymentStatus = paymentStatus;
    await request.save();

    return res.status(200).json({
      message: "Withdrawal request status updated successfully.",
      request,
    });
  } catch (error) {
    console.error("Error updating withdrawal request status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to fetch all withdrawal requests
exports.getAllWithdrawRequests = async (req, res) => {
  try {
    const withdrawRequests = await WithdrawPaymentRequest.find()
      .populate("userId", "username email") // Adjust according to your User model's fields
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    return res.status(200).json(withdrawRequests);
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { userName, mobileNumber, email, accountNumber, ifscCode, wallet } =
    req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the user's information
    if (userName) user.userName = userName;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (email) user.email = email;
    if (accountNumber) user.accountNumber = accountNumber;
    if (ifscCode) user.ifscCode = ifscCode;
    if (wallet) user.wallet = wallet;

    // Save the updated user data
    await user.save();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "User information updated successfully",
    });
  } catch (error) {
    console.error("Error updating user information:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user information" });
  }
};

exports.getAllBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ blocked: true });
    res.status(200).json(users);
  } catch (err) {
    console.log("no user");
    res.status(400).json({ error: err.message });
  }
};

exports.updateUserBlockedStatus = async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;

  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.blocked = blocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${blocked ? "blocked" : "unblocked"} successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addOrDeductWallet = async (req, res) => {
  const { userId, amount, transactionType, walletType, description } = req.body;
  console.log("body ==>", req.body);

  try {
    const user = await User.findOne({ referralCode: userId });

    if (!user) {
      console.log("No user found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("user ==>", user);

    // Handle adding or deducting amounts based on wallet type
    if (transactionType === "add") {
      if (walletType === "r-wallet") {
        user.rechargeWallet += Number(amount);
      } else if (walletType === "e-wallet") {
        user.earningWallet += Number(amount);
        user.totalEarning += Number(amount);
      } else if (walletType === "trading-wallet") {
        user.tradingWallet += Number(amount); // Add amount to tradingWallet
      }
    } else if (transactionType === "deduct") {
      if (walletType === "r-wallet") {
        user.rechargeWallet -= Number(amount);
      } else if (walletType === "e-wallet") {
        user.earningWallet -= Number(amount);
      } else if (walletType === "trading-wallet") {
        user.tradingWallet -= Number(amount); // Deduct amount from tradingWallet
      }
    } else {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    console.log("Updated user wallet ==>", user);
    console.log(
      `user.id => ${user._id}, amount => ${amount}, type => ${transactionType}`
    );

    // Save the updated user wallet
    await user.save();

    // Log the transaction
    const transaction = new AddTransaction({
      user: user._id,
      userCode: user.referralCode,
      amount,
      type: transactionType,
      description,
    });

    await transaction.save();

    const tradetransaction = new TradingIncome({
      userId: _id,
      referralCode: referralCode,
      amount: incomeToAdd,
      tradingWallet: tradingWallet,
    });
    await tradetransaction.save();

    res.status(200).json(user);
  } catch (err) {
    console.error("Error occurred:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const countActiveUsersInSubtree = async (userId, count = 0) => {
  const user = await User.findById(userId)
    .populate("leftChild")
    .populate("rightChild");
  if (!user) return count;

  // Increment count if the user is active
  if (user.isActive) count++;

  // Recursively check the left and right children
  if (user.leftChild) {
    count = await countActiveUsersInSubtree(user.leftChild._id, count);
  }

  if (user.rightChild) {
    count = await countActiveUsersInSubtree(user.rightChild._id, count);
  }

  return count;
};




async function calculateRankSalary(user) {
  const rankConfig = [
    { threshold: 5 },
    { threshold: 15 },
    { threshold: 40 },
    { threshold: 90 },
    { threshold: 190 },
    { threshold: 440 },
    { threshold: 940 },
    { threshold: 1940 },
    { threshold: 4440 },
    { threshold: 9440 },
    { threshold: 16940 },
    { threshold: 26940 },
    { threshold: 41940 },
    { threshold: 66940 },
    { threshold: 116940 },
    { threshold: 216940 },
  ];
  const matchedPairsCount = user.matchedPairs.length;

  const userRank = rankConfig.find(rank => matchedPairsCount >= rank.threshold);
  if (userRank) {
    // const salaryToAdd = userRank.salary;
    // user.salaryIncome += salaryToAdd;
    // user.rank = userRank.rank;
    await user.save();
    console.log(`User ${user.email} received rank salary: ${salaryToAdd}`);
  } else {
    console.log(`User ${user.email} does not meet rank threshold for salary.`);
  }
}




async function calculateMatchingIncome(user) {
  console.log("Calculating matching income for:", user.email);

  // Ensure the user is active to be eligible for matching income
  if (!user || !user.isActive) {
    return 0;
  }

  // Initialize matchedPairs if it's undefined
  if (!user.matchedPairs) {
    user.matchedPairs = [];
  }

  let totalIncome = 0;

  // Step 1: Check 2:1 or 1:2 initial matching condition if not yet received
  if (!user.hasReceivedFirstMatchingIncome) {
    const leftIncome = await checkMatching(user.leftChild);
    const rightIncome = await checkMatching(user.rightChild);

    // Check for 2:1 or 1:2 matching condition
    if (leftIncome.activeCount >= 2 && rightIncome.activeCount >= 1) {
      totalIncome += calculateIncome(1);
      user.hasReceivedFirstMatchingIncome = true;
    } else if (rightIncome.activeCount >= 2 && leftIncome.activeCount >= 1) {
      totalIncome += calculateIncome(1);
      user.hasReceivedFirstMatchingIncome = true;
    }
  }

  // Step 2: Check 1:1 matching if the initial condition was met
  if (user.hasReceivedFirstMatchingIncome) {
    totalIncome += await calculate1to1MatchingIncome(
      user.leftChild,
      user.rightChild,
      user
    );
  }

  console.log("Total income =>", totalIncome);
  return totalIncome;
}

// Function to calculate 1:1 matching income for active users at each level

// Recursive function to count active users in the subtree
async function checkMatching(userId) {
  if (!userId) return { activeCount: 0 };

  const user = await User.findById(userId);
  if (!user) return { activeCount: 0 };

  let activeCount = user.isActive ? 1 : 0;
  const leftResult = await checkMatching(user.leftChild);
  const rightResult = await checkMatching(user.rightChild);

  activeCount += leftResult.activeCount + rightResult.activeCount;

  return { activeCount };
}

// Function to collect active users at each level
async function collectActiveUsersAtLevel(userId, level, currentLevel = 1) {
  if (!userId || currentLevel > level) return [];

  const user = await User.findById(userId);
  if (!user) return [];

  if (currentLevel === level && user.isActive) {
    return [user];
  }

  return [
    ...(await collectActiveUsersAtLevel(
      user.leftChild,
      level,
      currentLevel + 1
    )),
    ...(await collectActiveUsersAtLevel(
      user.rightChild,
      level,
      currentLevel + 1
    )),
  ];
}

// Function to calculate 1:1 matching income for active users at each level
async function calculate1to1MatchingIncome(leftUserId, rightUserId, user) {
  let income = 0;
  let level = 1;
  let hasMoreLevels = true;

  // Continue to check each level until there are no more active users at that level
  while (hasMoreLevels) {
    const leftActiveUsers = await collectActiveUsersAtLevel(leftUserId, level);
    const rightActiveUsers = await collectActiveUsersAtLevel(
      rightUserId,
      level
    );

    // Match each active user on the left with an active user on the right
    let matchCount = 0;
    for (
      let i = 0;
      i < Math.min(leftActiveUsers.length, rightActiveUsers.length);
      i++
    ) {
      const leftUser = leftActiveUsers[i];
      const rightUser = rightActiveUsers[i];

      // Check if this pair has already been matched at this level
      const pairExists = user.matchedPairs.some(
        (pair) =>
          pair.leftUserId === leftUser._id.toString() &&
          pair.rightUserId === rightUser._id.toString() &&
          pair.level === level
      );

      if (!pairExists) {
        // Add the new match pair to matchedPairs
        user.matchedPairs.push({
          leftUserId: leftUser._id.toString(),
          rightUserId: rightUser._id.toString(),
          level,
        });
      
        
        matchCount++;
      }
    }

    // Calculate income for new matches only
    income += matchCount * calculateIncome(1);

    // Stop if no active users are found at the current level on both sides
    if (leftActiveUsers.length === 0 && rightActiveUsers.length === 0) {
      hasMoreLevels = false;
    }

    level++;
  }

  // Save updated matched pairs to the user
  await user.save();
  // await CalculateRankSalary();
  // await DistributeRankSalary();
  console.log("Income return =>", income);
  return income;
}




// Function to calculate income based on match type
function calculateIncome(matchType) {
  const incomePerMatch = 5; // $5 per match
  return matchType * incomePerMatch;
}





async function distributeMatchingIncome() {
  // Fetch all users
  const allUsers = await User.find();

  // Iterate over each user and calculate matching income
  for (const tempUser of allUsers) {
    if (tempUser.isActive) {
      console.log("Calculating matching income for:", tempUser.email);

      // Await the resolved income value from calculateMatchingIncome
      const income = await calculateMatchingIncome(tempUser);
      console.log("Resolved Income for", tempUser.email, ":", income);

      // Update the user's wallets and matching income
      tempUser.earningWallet += income;
      tempUser.matchingWallet += income;
      tempUser.matchingIncome += income;

      // Save the updated user data to the database
      await tempUser.save();
      const matchingIncomeRecord = new MatchingIncome({
        user: tempUser._id,
        referralCode: tempUser.referralCode,
        amount: income,
      });

      await matchingIncomeRecord.save();
      console.log("Updated user in database:", tempUser._id);
    }
  }

  console.log("Income distribution completed for all active users.");
}



exports.activateUser = async (req, res) => {
  console.log("body activation ==>", req.body);
  try {
    const { referralCode } = req.body;
    console.log("body  activation ==>", req.body);

    // Find the user who is purchasing the package
    const user = await User.findOne({ referralCode });
    if (user.isActive) {
      return res.status(500).json({ error: 'User Already Active' });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.isActive = true;
    await user.save();
    const activation = new ActivationTransaction({
      user: user.referralCode,
      referralCode: user.referralCode,
      // mobileNumber: user.phone,
      activateBy: "admin",
    });
    const newBullPurchsed = new BotPurchased({
      user: user._id,
      amount: 60,
      purchasedBy: "Admin",
    });
    await newBullPurchsed.save();
    await activation.save();

    distributeMatchingIncome();

    console.log(
      `Bull purchased for user: ${user.referralCode}, $60 deducted from recharge wallet`
    );
    let message = `Bull purchased successfully. $60 deducted from recharge wallet.`;

    // Profit distribution logic to uplines (5 levels)
    let profitDistribution = [
      { percentage: 10, description: "1st upline" }, // 10% for the first upline
      { percentage: 5, description: "2nd upline" }, // 5% for the second upline
      { percentage: 5, description: "3rd upline" }, // 5% for the third upline
      { percentage: 2.5, description: "4th upline" }, // 2.5% for the fourth upline
      { percentage: 2.5, description: "5th upline" }, // 2.5% for the fifth upline
    ];

    let currentUser = user;
    let levelMessages = [];

    for (let level = 0; level < profitDistribution.length; level++) {
      const uplineUser = await User.findOne({
        referralCode: currentUser.referredBy,
      });
      if (!uplineUser) {
        console.log(
          `No upline user found for referral code: ${currentUser.referredBy}`
        );
        levelMessages.push(`No upline found at level ${level + 1}`);
        break;
      }

      const profit = (60 * profitDistribution[level].percentage) / 100;

      if (uplineUser.isActive) {
        uplineUser.bullWallet += profit;

        const newBotLevelIncome = new BotLevelIncome({
          user: uplineUser._id,
          fromUser: user.referralCode,
          level: level + 1,
          percentage: profitDistribution[level].percentage,
          amount: profit,
        });


        await newBotLevelIncome.save(); // Ensure this line is active to save each transaction

        // await newBotLevelIncome.save();
      }

      await uplineUser.save();
      const uplineMessage = `${profitDistribution[level].description} (User ID: ${uplineUser._id}) received ${profit} as profit`;
      console.log(uplineMessage);
      levelMessages.push(uplineMessage);

      // Set the current user to the upline for the next iteration
      currentUser = uplineUser;
    }

    // Send response with success message and details of profit distribution
    res.status(200).json({
      message: message,
      profitDistributionDetails: levelMessages,
    });
    // console.log('income ==>',profitTransaction);

    await activation.save();
    // res.status(200).json({ message: 'User activated and package assigned', user });
    // console.log({ message: 'User activated and package assigned', user });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateWithdrawlPaymentStatus = async (req, res) => {
  // console.log("update withdraw status called=>",req.params);

  const { transactionId } = req.params; // Get the transaction ID from the request parameters
  const { paymentStatus } = req.body; // Get the new payment status from the request body

  try {
    // Validate the paymentStatus input
    const validStatuses = ["Processing", "Approved", "Canceled"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    // Find the transaction by its ID and update its payment status
    const updatedTransaction = await WithdrawPaymentRequest.findByIdAndUpdate(
      { _id: transactionId },
      { paymentStatus },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Respond with the updated transaction
    res.status(200).json({
      message: "Payment status updated successfully",
      data: updatedTransaction,
    });
  } catch (err) {
    console.error("Error updating payment status:", err);
    res
      .status(500)
      .json({ message: "Server error while updating payment status" });
  }
};

exports.AdminRegister = async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    let admin = await AdminCredentials.findOne({ mobileNumber });
    if (admin) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already registered" });
    }

    admin = new AdminCredentials({
      mobileNumber,
      password, // Store the original password directly
    });
    await admin.save();
    res
      .status(201)
      .json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).lean();
    res.status(200).json(users);
  } catch (err) {
    console.log("Error fetching active users:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.getDownlineUsers = async (req, res) => {
  const { userId } = req.params;
  try {
    // Find the main user
    const user = await User.findOne({ referralCode: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Recursively find all downline users with their levels
    const findDownlines = async (referralCode, level) => {
      const downlines = await User.find({ referredBy: referralCode });
      let result = [];

      for (const downline of downlines) {
        const downlineUsers = await findDownlines(
          downline.referralCode,
          level + 1
        );
        result.push({
          ...downline.toObject(),
          level,
          downlineUsers,
        });
      }

      return result;
    };

    const downlineUsers = await findDownlines(user.referralCode, 1);

    res.status(200).json({ downlineUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getActivationList = async (req, res) => {
  try {
    const result = await ActivationTransaction.find();
    console.log("result", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllUnPaidUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: false });
    res.status(200).json(users);
  } catch (err) {
    console.log("no user");
    res.status(400).json({ error: err.message });
  }
};

exports.Adminlogin = async (req, res) => {
  const { mobileNumber, password } = req.body;
  console.log("admin==>", req.body);
  try {
    const admin = await AdminCredentials.findOne({ mobileNumber });
    console.log("admin=>", admin);

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number or password" });
    }

    if (password !== admin.password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number or password" });
    }

    const token = jwt.sign(
      { id: admin._id, mobileNumber: admin.mobileNumber },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        mobileNumber: admin.mobileNumber,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { mobileNumber, password, wallet } = req.body;
    const user = await UserModel.findById(req.user._id);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: password || user.password, // Directly store the password
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

exports.getAddDeductList = async (req, res) => {
  try {
    const addDeductList = await AddTransaction.find();
    console.log("result", addDeductList);
    res.status(200).send(addDeductList);
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
};
