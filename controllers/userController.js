const User = require("../models/User");
const Product = require("../models/addPackage");
const WithdrawPaymentRequest = require("../models/withdrawPaymentRequest");
const BotPurchased = require("../models/botIncome");
const BotLevelIncome = require("../models/botLevelIncome");
const TradingIncome = require('../models/tradingIncome');
const MatchingIncome = require('../models/matchingIncome');
const TradingIncomePercent = require('../models/tradingIncomePercent');



// Adjust the path to your User model

exports.signupController = async (req, res) => {
  const {userName, email, phone, referredBy, walletAddress, preferredSide } = req.body;

  console.log("wallet===>", req.body.walletAddress);
  console.log("Type:", typeof walletAddress);   
  console.log("dataa=>>>", req.body);

  try {
    // Check if the email already exists in the database
    if(!userName||!email||!phone){
      return res.status(400).json({ message: "Fill All The Fields" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email Address  already exists." });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone Number  already exists." });
    }

    const existingWallet = await User.findOne({ walletAddress });
    if (existingWallet) {
      return res.status(400).json({ message: "Wallet Address  already exists." });
    }

    // 1. Check if this is the first user (no users in the system)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("wallet inside if ===>", req.body.walletAddress);

      

      // If this is the first user, no need for referredBy or preferredSide
      const newUser = new User({
        userName,
        email,
        phone,
        walletAddress,
        referralCode: generateReferralCode(),
        // referralCode: walletAddress,
      });

      await newUser.save();
      return res
        .status(201)
        .json({ message: "First user successfully created!", user: newUser });
    }

    let parentUser;

    // 2. If referredBy is provided, find the parent by referral code
    if (referredBy) {
      parentUser = await User.findOne({ referralCode: referredBy });
      if (!parentUser) {
        return res.status(400).json({ message: "Invalid referral code." });
      }
    }

    // 4. Ensure the preferredSide input is valid
    if (preferredSide !== "left" && preferredSide !== "right") {
      return res
        .status(400)
        .json({ message: 'preferredSide must be either "left" or "right".' });
    }

    // 5. Traverse the binary tree to find an available preferredSide based on the user's choice (left or right)
    const targetParent = await findAvailablepreferredSide(
      parentUser,
      preferredSide
    );

    // 6. If no preferredSide is available (this case is unlikely but can occur if something goes wrong)
    if (!targetParent) {
      return res
        .status(500)
        .json({
          message: "No available preferredSide found. Please try again.",
        });
    }



    console.log("wallet inside if ===>", req.body.walletAddress);

    // 7. Create the new user
    const newUser = new User({
      userName,
      email,
      phone,
      referralCode: generateReferralCode(), // Implement a function to generate a unique referral code
      // referralCode: walletAddress, // Implement a function to generate a unique referral code
      referredBy: targetParent.referralCode,
      walletAddress
    });

    // 8. Assign the user to the appropriate preferredSide (left or right)
    if (preferredSide === "left" && !targetParent.leftChild) {
      targetParent.leftChild = newUser._id;
    } else if (preferredSide === "right" && !targetParent.rightChild) {
      targetParent.rightChild = newUser._id;
    }

    // 9. Save both the parent and the new user
    await newUser.save();
    await targetParent.save();

    // 10. Respond with success
    return res
      .status(201)
      .json({ message: "User successfully created!", user: newUser });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};












exports.getAllTeamTree = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).populate("leftChild rightChild");

    // Create a recursive function to build the tree structure
    const buildUserTree = (user) => {
      if (!user) return null;

      const leftChild = user.leftChild ? buildUserTree(user.leftChild) : null;
      const rightChild = user.rightChild
        ? buildUserTree(user.rightChild)
        : null;

      const tree = {
        name: user.email, // You can change this to any user field like name
        children: [],
      };

      if (leftChild) tree.children.push(leftChild);
      if (rightChild) tree.children.push(rightChild);

      return tree;
    };

    const treeData = buildUserTree(user);

    res.json(treeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user tree." });
  }
};

// Recursive function to find an available preferredSide in the binary MLM tree
const findAvailablepreferredSide = async (user, preferredSide) => {
  // Check if the desired preferredSide is available
  if (preferredSide === "left") {
    if (!user.leftChild) {
      return user; // Return the user if the left preferredSide is vacant
    } else {
      // Traverse down the left subtree
      const leftChild = await User.findById(user.leftChild);
      return await findAvailablepreferredSide(leftChild, "left"); // Continue recursively
    }
  } else if (preferredSide === "right") {
    if (!user.rightChild) {
      return user; // Return the user if the right preferredSide is vacant
    } else {
      // Traverse down the right subtree
      const rightChild = await User.findById(user.rightChild);
      return await findAvailablepreferredSide(rightChild, "right"); // Continue recursively
    }
  }
};

// Helper function to generate a unique referral code
const generateReferralCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
  return `UTI${randomNumber}`;
};











// controllers/tradingIncomeController.js

// Function to update the trading wallet daily


// Ensure you have this import

exports.updateTradingIncome = async () => {
  console.log("called===>");

  try {
    // Fetch the trading income percentage from the database
    const tradingIncomePercentDoc = await TradingIncomePercent.findOne(); // Adjust query if needed
    const incomePercent = tradingIncomePercentDoc ? tradingIncomePercentDoc.percent : 0.05; // Default to 5% if not found

    const users = await User.find({
      isActive: true,
      tradingWallet: { $gt: 0 },
    });

    await Promise.all(users.map(async (user) => {
      const { tradingWallet, tradingIncome, earningWallet, referralCode, _id } = user;

      // Calculate 210% of the original trading wallet amount
      const maxIncome = tradingWallet * 2.1;

      // Check if the user has reached 210% of the initial trading wallet value
      if (tradingIncome < maxIncome) {
        // Calculate the dynamic percentage of the current trading wallet
        const incomeToAdd = tradingWallet * incomePercent;

        // Ensure we don't add more than the remaining amount to reach 210%
        const finalIncomeToAdd = Math.min(incomeToAdd, maxIncome - tradingIncome);

        // Update user earnings and trading income
        user.tradingWallet += finalIncomeToAdd;
        user.tradingIncome += finalIncomeToAdd;

        // Save the updated user
        await user.save();

        // Log the transaction in the database
        const transaction = new TradingIncome({
          userId: _id,
          referralCode: referralCode,
          amount: finalIncomeToAdd,
          tradingWallet: tradingWallet,
        });

        await transaction.save();
      } else {
        // If the user has reached their limit, set tradingWallet to 0
        user.tradingWallet = 0;
        await user.save();
      }
    }));

    console.log('Daily trading income update and transaction logging completed.');
  } catch (error) {
    console.error('Error updating trading income or logging transaction:', error);
  }
};







const countActiveUsersInSubtree = async (userId, count = 0) => {
  const user = await User.findById(userId).populate('leftChild').populate('rightChild');
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

// Function to calculate matching income
 // Import the MatchingIncome model
// Assuming you have the User model imported

const calculateMatchingIncome = async (parentId) => {
  try {
    const user = await User.findById(parentId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.matchingIncome > 300) {
      console.log("Matching Income exceeds $300");
      return;
    }

    // Count active users on both the left and right sides of the tree
    const leftActiveCount = await countActiveUsersInSubtree(user.leftChild);
    const rightActiveCount = await countActiveUsersInSubtree(user.rightChild);

    console.log("Left active count:", leftActiveCount);
    console.log("Right active count:", rightActiveCount);

    // Check for matching pairs (2:1 or 1:2)
    let isMatchingPair = false;
    if (!user.hasReceivedFirstMatchingIncome) {
      isMatchingPair = (leftActiveCount >= 2 && rightActiveCount >= 1) ||
        (leftActiveCount >= 1 && rightActiveCount >= 2);
      
      if (isMatchingPair) {
        user.hasReceivedFirstMatchingIncome = true;
      }
    } else {
      isMatchingPair = (leftActiveCount === rightActiveCount);
      if (isMatchingPair) {
        // Update rank salary activation based on active counts (as per your logic)
        updateRankSalary(user, leftActiveCount);
      }
    }

    if (isMatchingPair) {
      // Update the user's matching income
      const matchingIncomeAmount = 5;  // Example: $5 for each matching pair
      user.matchingIncome += matchingIncomeAmount;
      user.hasReceivedFirstMatchingIncome = false;
      await user.save();

      // Store the matching income in the MatchingIncome collection
      const matchingIncomeRecord = new MatchingIncome({
        user: user._id,
        referralCode: user.referralCode,
        amount: matchingIncomeAmount,
      });

      await matchingIncomeRecord.save(); // Save the record to the database

      console.log(`Matching income updated for user: ${user.email}, new income: $${user.matchingIncome}`);
    } else {
      console.log('No matching pair found.');
    }

    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Error in calculating matching income');
  }
};

// Helper function to update rank salary based on active counts
const updateRankSalary = async (user, leftActiveCount) => {
  const rankThresholds = [5, 15, 40, 90, 190, 440, 940, 1940, 4440, 9440, 16940, 26940, 41940, 66940, 116940, 216940];
  
  for (let i = 0; i < rankThresholds.length; i++) {
    if (leftActiveCount === rankThresholds[i]) {
      user.rankSalaryActivation[i] = true;
      user.rankSalaryStartDate[i] = Date.now();
      if (i > 0) {
        user.rankSalaryActivation[i - 1] = false; // Deactivate the previous rank
      }
      await user.save();
      break;
    }
  }
};





 // Adjust the path as necessary

// Define the rank income amounts
const rankIncomeAmounts = [5, 10, 20, 30, 60, 150, 300, 600, 1500, 3000, 4500, 6000, 9000, 15000, 30000, 60000];

// Function to distribute rank income to users
 exports.distributeRankIncome = async () => {
  try {
    // Get current date
    const currentDate = new Date();
    
    // Find all users with rank income activated
    const users = await User.find({ rankSalaryActivation: { $elemMatch: { $eq: true } } });

    // Iterate through users to distribute rank income
    for (const user of users) {
      // Check if the user has rank income activated
      const rankIndex = user.rankSalaryActivation.findIndex(active => active === true);
      if (rankIndex !== -1) {
        // Calculate the user's rank income amount
        const rankIncomeAmount = rankIncomeAmounts[rankIndex];
        
        // Calculate the user's rank salary start date
        const startDate = user.rankSalaryStartDate[rankIndex];
        
        // Calculate the number of weeks since the rank salary start date
        const weeksSinceStart = Math.floor((currentDate - new Date(startDate)) / (1000 * 60 * 60 * 24 * 7));

        // Ensure we only credit for up to 5 weeks
        const weeksToCredit = Math.min(weeksSinceStart, 5);
        const totalCredit = weeksToCredit * rankIncomeAmount;

        // Update the user's earning wallet
        if (totalCredit > 0) {
          user.earningWallet += totalCredit; // Credit the total amount to the user's earning wallet
          await user.save(); // Save the updated user document
          console.log(`Credited ${totalCredit} to user ${user._id} earning wallet.`);
        }
      }
    }
  } catch (error) {
    console.error('Error distributing rank income:', error);
  }
};






exports.updateToZero=async ()=>{
  const all_users=await User.find();
  for(let tempuser in all_users){
    tempuser.totalIncome +=tempuser.matchingIncome;
    tempuser.matchingIncome=0;
   await tempuser.save();
  }
}




exports.Recharge_to_Trading = async (req, res) => {

  // console.log("Recharge_to_Trading ========================================")
  try {
    const { userId } = req.params; // Extract user ID from request parameters
    const { amount } = req.body; // Get the transfer amount from the request body

    // Check if the amount is valid
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount must be at least $100.',
      });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if the recharge wallet has enough balance
    if (user.rechargeWallet < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds in recharge wallet.',
      });
    }

    // Perform the transfer
    user.rechargeWallet -= amount;
    user.tradingWallet += amount;

    // Save the updated user data
    await user.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: `Successfully transferred $${amount} to trading wallet.`,
      rechargeWallet: user.rechargeWallet,
      tradingWallet: user.tradingWallet,
    });
  } catch (error) {
    console.error('Error in Recharge_to_Trading:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
};





exports.BotLevelIncome = async (req, res) => {
  console.log("helo================================")
  const userId = req.params.userId;
console.log("bolt level -id =>",userId)
  try {
    const result = await BotLevelIncome.find({ user: userId });

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bot level income found for the specified user."
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error during retrieving bot level income:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bot level income. Please try again later."
    });
  }
};






exports.UserMatchingIncome = async (req, res) => {
  console.log("helo================================")
  const userId = req.params.userId;
console.log("bolt level -id =>",userId)
  try {
    const result = await MatchingIncome.find({ user: userId });

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trading income found for the specified user."
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error during retrieving trading income:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bot level income. Please try again later."
    });
  }
};







// exports.UserRankIncome = async (req, res) => {
//   console.log("helo================================")
//   const userId = req.params.userId;
// console.log("bolt level -id =>",userId)
//   try {
//     const result = await MatchingIncome.findOne({ _id: userId });

//     if (!result || result.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No trading income found for the specified user."
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (error) {
//     console.error("Error during retrieving trading income:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching bot level income. Please try again later."
//     });
//   }
// };





exports.UserTradingIncome = async (req, res) => {
  console.log("helo================================")
  const userId = req.params.userId;
console.log("bolt level -id =>",userId)
  try {
    const result = await TradingIncome.find({ userId: userId });

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trading income found for the specified user."
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error during retrieving trading income:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bot level income. Please try again later."
    });
  }
};



const moment = require('moment'); // For date manipulation

exports.withdrawlRequest = async (req, res) => {
  const userId = req.params.userId;
  const { amount, walletType } = req.body; // Get the withdrawal amount and selected wallet type from the request body

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the withdrawal amount is valid
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid amount.' });
    }

    // Ensure withdrawals can only be made on Saturdays and Sundays
    const currentDay = moment().day();
    if (currentDay !== 6 && currentDay !== 0) { // 6 is Saturday, 0 is Sunday
      return res.status(400).json({ message: 'Withdrawals are only allowed on Saturdays and Sundays.' });
    }

    // Check withdrawal frequency for tradingWallet (once a month)
    if (walletType === 'tradingWallet') {
      const lastTradingWithdrawal = await WithdrawPaymentRequest.findOne({ 
        userId, 
        walletType: 'tradingWallet',
        paymentStatus: { $in: ['Processing', 'Completed'] } 
      }).sort({ createdAt: -1 }); // Get the most recent request

      if (lastTradingWithdrawal && moment().diff(moment(lastTradingWithdrawal.createdAt), 'months') < 1) {
        return res.status(400).json({ message: 'You can only withdraw from the Trading Wallet once per month.' });
      }
    }

    // Check withdrawal frequency for bullWallet (once a week)
    if (walletType === 'bullWallet') {
      const lastBullWithdrawal = await WithdrawPaymentRequest.findOne({ 
        userId, 
        walletType: 'bullWallet',
        paymentStatus: { $in: ['Processing', 'Completed'] }
      }).sort({ createdAt: -1 }); // Get the most recent request

      if (lastBullWithdrawal && moment().diff(moment(lastBullWithdrawal.createdAt), 'weeks') < 1) {
        return res.status(400).json({ message: 'You can only withdraw from the Bull Wallet once per week.' });
      }
    }

    // Determine the selected wallet's balance
    let walletBalance;
    if (walletType === 'earningWallet') {
      walletBalance = user.earningWallet;
    } else if (walletType === 'bullWallet') {
      walletBalance = user.bullWallet;
    } else if (walletType === 'tradingWallet') {
      walletBalance = user.tradingWallet;
    } else {
      return res.status(400).json({ message: 'Invalid wallet type selected.' });
    }

    // Check if the user has sufficient balance in the selected wallet
    if (amount > walletBalance) {
      return res.status(400).json({ message: 'Insufficient balance in the selected wallet.' });
    }

    // Create a new withdrawal request
    const withdrawalRequest = new WithdrawPaymentRequest({
      userId,
      walletAddress: user.walletAddress, // Include the user's wallet address
      amount,
      walletType, // Store the selected wallet type
      referralCode: user.referralCode, // Include the user's referral code
      paymentStatus: 'Processing', // Set initial status to "Processing"
    });

    await withdrawalRequest.save();

    // Deduct the amount from the selected wallet
    if (walletType === 'earningWallet') {
      user.earningWallet -= amount;
    } else if (walletType === 'bullWallet') {
      user.bullWallet -= amount;
    } else if (walletType === 'tradingWallet') {
      user.tradingWallet -= amount;
    }

    await user.save(); // Save the updated user with the new wallet balance

    return res.status(200).json({ message: 'Withdrawal request submitted successfully.' });
  } catch (error) {
    console.error('Error in withdrawal request:', error);
    return res.status(500).json({ message: 'Failed to submit the withdrawal request.' });
  }
};






exports.getUserWithdrawalRequests = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch all withdrawal requests for the user
    const requests = await WithdrawPaymentRequest.find({ userId }).sort({ createdAt: -1 }); // Sort by creation date
    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching withdrawal requests: ', error);
    return res.status(500).json({ message: 'Failed to fetch withdrawal requests.' });
  }
};







// Matching income logic
// const MatchingIncome = async (userId) => {
//   try {
//     // Fetch the user who has just been activated or is being checked for matching income
//     const user = await User.findById(userId);

//     if (!user) {
//       console.log(`User with ID: ${userId} not found`);
//       return;
//     }

//     if (!user.isActive) {
//       console.log(`User with ID: ${userId} is not active`);
//       return;
//     }

//     // Initialize matching income settings
//     const maxMatchingIncome = 300; // Maximum matching income a user can earn
//     const firstMatchingIncome = 5; // Income for first matching (2:1 or 1:2)
//     const secondMatchingIncome = 5; // Income for second matching (1:1)

//     // Traverse upwards through the upline structure
//     let currentUser = user;

//     while (currentUser.referredBy) {
//       const uplineUser = await User.findOne({ referralCode: currentUser.referredBy });
//       console.log(`${currentUser.email} parent user of ${uplineUser?.email}`);

//       if (!uplineUser) {
//         console.log(`No upline found for user with referral code: ${currentUser.referredBy}`);
//         break;
//       }

//       if (uplineUser.matchingIncome >= maxMatchingIncome) {
//         console.log(`Upline user with ID: ${uplineUser._id} has reached the maximum matching income limit`);
//       } else {
//         let leftActiveUsers = await countActiveUsers(uplineUser.leftChild);
//         let rightActiveUsers = await countActiveUsers(uplineUser.rightChild);

//         console.log(`${uplineUser.email}: ${leftActiveUsers} left active users, ${rightActiveUsers} right active users`);

//         // First matching (2:1 or 1:2), can only happen once
//         if (!uplineUser.hasReceivedFirstMatchingIncome) {
//           if ((leftActiveUsers >= 2 && rightActiveUsers >= 1) || (leftActiveUsers >= 1 && rightActiveUsers >= 2)) {
//             uplineUser.earningWallet += firstMatchingIncome;
//             uplineUser.matchingIncome += firstMatchingIncome;
//             uplineUser.hasReceivedFirstMatchingIncome = true; // Mark first matching as completed
//             await uplineUser.save();

//             console.log(`Upline user with ID: ${uplineUser._id} earned $${firstMatchingIncome} from 2:1 or 1:2 matching`);
//           }
//         }

//         // Second matching (1:1), can happen multiple times
//         if (uplineUser.hasReceivedFirstMatchingIncome) {
//           while (leftActiveUsers > 0 && rightActiveUsers > 0 && uplineUser.matchingIncome < maxMatchingIncome) {
//             uplineUser.earningWallet += secondMatchingIncome;
//             uplineUser.matchingIncome += secondMatchingIncome;

//             leftActiveUsers--;
//             rightActiveUsers--;

//             console.log(`Upline user with ID: ${uplineUser._id} earned $${secondMatchingIncome} from 1:1 matching`);

//             if (uplineUser.matchingIncome >= maxMatchingIncome) {
//               console.log(`Upline user with ID: ${uplineUser._id} has reached the $300 matching income limit`);
//               break;
//             }

//             await uplineUser.save();
//           }
//         }
//       }

//       // Move up to the next upline
//       currentUser = uplineUser;
//     }

//     console.log("Matching income distribution completed from root!");
//   } catch (error) {
//     console.error("Error in MatchingIncome function:", error);
//   }
// };

// // Helper function to count active users on a side (leftChild or rightChild)
// async function countActiveUsers(userId) {
//   if (!userId) {
//     console.log("No user found on this side");
//     return 0;
//   }

//   try {
//     const user = await User.findById(userId);

//     if (!user || !user.isActive) {
//       return 0;
//     }

//     // Recursively count active users for both left and right children
//     const leftCount = await countActiveUsers(user.leftChild);
//     const rightCount = await countActiveUsers(user.rightChild);

//     return 1 + leftCount + rightCount; // Count this user plus all children
//   } catch (error) {
//     console.error("Error in countActiveUsers function:", error);
//     return 0;
//   }
// }

// module.exports = MatchingIncome;

















// Purchase Bull functionality
exports.PurchaseBull = async (req, res) => {
  console.log("Purchase Bull==>", req.params.id);

  try {
    // Fetch the user making the purchase
    const user = await User.findById(req.params.id);
    const userId = user._id;

    if (!user) {
      console.log(`User with ID: ${req.params.id} not found`);
      return res.status(404).json({ message:` User not found `});
    }

    // Check if the user has enough balance in the recharge wallet
    const bullPrice = 60; // Bull price is $60
    if (user.rechargeWallet < bullPrice) {
      console.log(
        `Insufficient balance in the recharge wallet for user: ${user.referralCode}`
      );
      return res
        .status(400)
        .json({ message: "Insufficient balance in recharge wallet" });
    }

    // Deduct $60 from the recharge wallet and activate the user
    user.rechargeWallet -= bullPrice;
    user.isActive = true;
    // MatchingIncome(userId);
    const all_users = await User.find()
    let all_id=[];

    // for(let i=0;i<all_users.length;i++){
    //   all_id.push(all_users[i]._id)
    // } 
    // console.log("alll_id--->",all_id);
    
    // for(let i=0;i<all_id.length;i++){
    //   await calculateMatchingIncome(all_id[0])
    //   console.log("useraaaa===>",all_id[i])
    // }
    // MatchingIncome(userId);
    // const all_users = await User.find()
    // let all_id=[];

    for(let i=0;i<all_users.length;i++){
      all_id.push(all_users[i]._id)
    } 
    console.log("alll_id--->",all_id);
    
    for(let i=0;i<all_id.length;i++){
      await calculateMatchingIncome(all_id[i])
      console.log("useraaaa===>",all_id[i])
    }
    await user.save();

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
      // Fetch the referring user (upline) based on the referralCode
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

      // Calculate the profit for the upline
      const profit = (bullPrice * profitDistribution[level].percentage) / 100;

      // Add the profit to the upline's earning wallet
      uplineUser.earningWallet += profit;

      const newBotLevelIncome = new BotLevelIncome({
        user: uplineUser._id,
        // fromUser: user._id,
        fromUser: user.referralCode,
        level: level,
        percentage: profitDistribution[level].percentage,
        amount: profit,
      })

      await uplineUser.save();
      await newBotLevelIncome.save();

      const uplineMessage = `${profitDistribution[level].description} (User ID: ${uplineUser._id}) received ${profit} as profit`;
      

      console.log(uplineMessage);
      levelMessages.push(uplineMessage);

      // Set the current user to the upline for the next iteration
      currentUser = uplineUser;
    }

    const activation = new ActivationTransaction({
      user: user.referralCode,
      email: user.email,
      mobileNumber: user.phone,
      activateBy: 'user',
    });


    const newBullPurchsed = new BotPurchased({
      user: user._id,
      amount: 60,
      purchasedBy: "User"
    })

    await newBullPurchsed.save();
    await activation.save();

    // Send response with success message and details of profit distribution
    res.status(200).json({
      message: message,
      profitDistributionDetails: levelMessages,
    });
  } catch (error) {
    console.error("Error in PurchaseBull function:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






//  trading income daily 

exports.dailyTradingIncome = () => {
  try {
    
  } catch (error) {
    
  }
}



















// Calculate Daily Referral Profits
exports.calculateDailyReferralProfits = async (userId) => {
  try {
    const user = await User.findById(userId);
    const referringUser = await User.findOne({ referralCode: user.referredBy });
    // console.log('user refer ==>',user);
    // console.log('user referring ==>',referringUser);

    if (!referringUser) {
      console.log(
        `Referring user not found for referral code: ${user.referredBy}`
      );
      return;
    }

    // Reset dailyReferralCount if it's a new day
    const today = new Date().setHours(0, 0, 0, 0);
    if (new Date(referringUser.lastReferralDate).setHours(0, 0, 0, 0) < today) {
      referringUser.dailyReferralCount = 0;
      referringUser.lastReferralDate = today;
    }

    // Get package details for the referred user and referring user
    const referredUserPackages = await Product.find({
      _id: { $in: user.packages },
    });
    const referringUserPackages = await Product.find({
      _id: { $in: referringUser.packages },
    });

    // console.log('referredUserPackages ==>',referredUserPackages);
    // console.log('referringUserPackages ==>',referringUserPackages);

    if (
      referredUserPackages.length === 0 ||
      referringUserPackages.length === 0
    ) {
      console.log(
        `No valid packages found for user: ${userId} or referring user: ${referringUser._id}`
      );
      return;
    }

    // Find the max package price for both referred user and referring user
    const referredUserMaxPackage = referredUserPackages.reduce((maxPkg, pkg) =>
      pkg.price > maxPkg.price ? pkg : maxPkg
    );
    const referringUserMaxPackage = referringUserPackages.reduce(
      (maxPkg, pkg) => (pkg.price > maxPkg.price ? pkg : maxPkg)
    );

    // console.log('referredUserMaxPackage ==>',referredUserMaxPackage);
    // console.log('referringUserMaxPackage ==>',referringUserMaxPackage);

    // Give profit only if referred user's max package price is >= referring user's max package price
    // if (referredUserMaxPackage.price >= referringUserMaxPackage.price) {
    referringUser.dailyReferralCount += 1;

    // Determine the profit level (1 to 3)
    const level = Math.min(referringUser.dailyReferralCount, 3);
    const profitMap = {
      1: {
        "A-1-540": 100,
        "B-2-1350": 120,
        "C-3-3150": 150,
        "D-4-6750": 200,
        "E-5-11250": 250,
        "F-6-29250": 300,
      },
      2: {
        "A-1-540": 120,
        "B-2-1350": 150,
        "C-3-3150": 200,
        "D-4-6750": 250,
        "E-5-11250": 300,
        "F-6-29250": 500,
      },
      3: {
        "A-1-540": 150,
        "B-2-1350": 200,
        "C-3-3150": 250,
        "D-4-6750": 300,
        "E-5-11250": 350,
        "F-6-29250": 500,
      },
    };

    // Get the profit amount for the referring user's max package
    const dailyProfit = profitMap[level][referredUserMaxPackage.name] || 0;

    referringUser.wallet += dailyProfit;
    referringUser.earningWallet += dailyProfit;
    referringUser.totalEarning += dailyProfit;
    referringUser.todayEarning += dailyProfit;
    referringUser.lastReferralDate = new Date(); // Update lastReferralDate to current time
    await referringUser.save();

    // console.log('referringUserUpdated ==>',referringUser);
    // console.log("user, amount, fromUser, package ===> ",referringUser._id,dailyProfit,userId,referringUserMaxPackage.name);

    const dailyReferralTransaction = new ReferralIncomeTransaction({
      user: referringUser._id,
      amount: dailyProfit,
      fromUser: user.referralCode,
      package: referredUserMaxPackage.name,
    });
    await dailyReferralTransaction.save();
    //  console.log('dailyReferralProfit ==>',dailyReferralTransaction);

    console.log(
      `Daily profit of ${dailyProfit} added to referring user: ${referringUser._id}`
    );
    // } else {
    //   console.log(Referred user's package price ${referredUserMaxPackage.price} is less than referring user's package price ${referringUserMaxPackage.price});
    // }
  } catch (err) {
    console.error("Error calculating daily referral profits:", err);
  }
};

exports.myTeamMembers = async (req, res) => {
  const { id, level } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch users at the specified level
    const levelUsers = await getUsersAtLevel(
      user.referralCode,
      parseInt(level)
    );

    // Manually populate packages
    const levelUsersWithPackages = await Promise.all(
      levelUsers.map(async (teamMember) => {
        const packages = await Product.find({
          _id: { $in: teamMember.packages },
        });
        return { ...teamMember.toObject(), packages };
      })
    );

    console.log(
      `Users at level ${level} with populated packages:`,
      levelUsersWithPackages
    );

    res.status(200).json(levelUsersWithPackages);
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to get users at a specific level
const getUsersAtLevel = async (referralCode, level) => {
  let usersAtLevel = [];

  for (let i = 1; i <= level; i++) {
    if (i === 1) {
      usersAtLevel = await User.find({ referredBy: referralCode });
    } else {
      const previousLevelUsers = usersAtLevel.map((user) => user.referralCode);
      usersAtLevel = await User.find({
        referredBy: { $in: previousLevelUsers },
      });
    }
  }

  return usersAtLevel;
};

exports.getAccountDetails = async (req, res) => {
  try {
    const result = await User.findOne({ _id: req.params.userId });
    console.log("reult", result);

    const { accountNumber, ifscCode, userName, wallet } = result;
    res.status(200).send({ accountNumber, ifscCode, userName, wallet });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAccountDetails = async (req, res) => {
  try {
    const { accountNumber, ifscCode, userName } = req.body;

    if (!accountNumber || !ifscCode || !userName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("datfatat=>");

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accountNumber, ifscCode, userName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Account details updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getLevelIncomeList = async (req, res) => {
  console.log(req.params.id);

  try {
    const result = await LevelIncomeTransaction.find({ user: req.params.id });
    console.log("result", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReferralsIncomeList = async (req, res) => {
  console.log(req.params.id);

  try {
    const result = await ReferralIncomeTransaction.find({
      user: req.params.id,
    });
    console.log("result", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWithdrawPaymentRequest = async (req, res) => {
  console.log("withdraw transaction called");

  const userId = req.params.id;
  try {
    const result = await WithdrawPaymentRequest.find({ userId });
    res.json(result);
  } catch (err) {
    console.log("Error while getting withdraw transactions:", err);
    res.status(500).send("Server Error");
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const result = await Payments.find({ userId: req.params.id });
    console.log("reult", result);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Use req.params.id to get the user ID
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log("error");
  }
};
