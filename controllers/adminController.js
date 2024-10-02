const User = require('../models/User');
const Package = require('../models/Package');
const jwt = require('jsonwebtoken');
const AdminCredentials = require('../models/Admin/Admin');
const JWT_SECRET = process.env.JWT_SECRET;
const Product = require('../models/addPackage');
const WithdrawPaymentRequest = require('../models/withdrawPaymentRequest');
const ActivationTransaction = require('../models/activationTransaction');
const AddTransaction = require('../models/addAndDeduct')
const BotLevelIncome = require("../models/botLevelIncome");
const BotPurchased = require("../models/botIncome");


exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { userName, mobileNumber, email, accountNumber, ifscCode, wallet } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
    res.status(200).json({ success: true, message: 'User information updated successfully' });
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ success: false, message: 'Failed to update user information' });
  }
};


exports.addOrDeductWallet = async(req, res) => {
  const { userId, amount, transactionType, walletType, description } = req.body;
  console.log('body ==>', req.body);
  
  try {
    const user = await User.findOne({ referralCode: userId });
    
    if (!user) {
      console.log('No user found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('user ==>', user);

    if (transactionType === 'add') {
      if (walletType === 'r-wallet') {
        user.rechargeWallet += Number(amount);
      } else {
        user.earningWallet += Number(amount);
        user.totalEarning += Number(amount);
      }
    } else {
      if (walletType === 'r-wallet') {
        user.rechargeWallet -= Number(amount);
      } else {
        user.earningWallet -= Number(amount);
      }
    }

    console.log("userWallet ==>", user);
    console.log(`user.id => ${user._id}, amount => ${amount}, type => ${transactionType}`);

    await user.save();

    const transaction = new AddTransaction({
      user: user._id,
      userCode: user.referralCode,
      amount,
      type: transactionType,
      description,
    });

    await transaction.save();
    res.status(200).json(user);
    
  } catch (err) {
    console.error("Error occurred:", err.message);
    res.status(400).json({ error: err.message });
  }
}


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
const calculateMatchingIncome = async (parentId) => {
  try {
    const user = await User.findById(parentId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.matchingIncome>300) {
      console.log("matching Income 300")
      return
    }

    // Count active users on both the left and right sides of the tree
    const leftActiveCount = await countActiveUsersInSubtree(user.leftChild);
    const rightActiveCount = await countActiveUsersInSubtree(user.rightChild);

    // Check for 2:1 or 1:2 ratio
    let isMatchingPair = false 
     if(!user.hasReceivedFirstMatchingIncome){
      isMatchingPair=(leftActiveCount >= 2 && rightActiveCount >= 1) ||
      (leftActiveCount >= 1 && rightActiveCount >= 2);
      
      if(isMatchingPair){
        user.hasReceivedFirstMatchingIncome=true;
      }

     }else{
      isMatchingPair=(leftActiveCount == rightActiveCount);
      if(isMatchingPair){
        if(leftActiveCount == 5){
           user.rankSalaryActivation[0] = true;
           user.rankSalaryStartDate[0] = Date.now();
           await user.save();
        }else if(leftActiveCount == 15){
          user.rankSalaryActivation[1] = true;
          user.rankSalaryActivation[0] = false;
          user.rankSalaryStartDate[1] = Date.now();
          await user.save();
        }else if(leftActiveCount == 40){
          user.rankSalaryActivation[2] = true;
          user.rankSalaryActivation[1] = false;
          user.rankSalaryStartDate[2] = Date.now();
          await user.save();
        }else if(leftActiveCount == 90){
          user.rankSalaryActivation[3] = true;
          user.rankSalaryActivation[2] = false;
          user.rankSalaryStartDate[3] = Date.now();
          await user.save();
        }else if(leftActiveCount == 190){
          user.rankSalaryActivation[4] = true;
          user.rankSalaryActivation[3] = false;
          user.rankSalaryStartDate[4] = Date.now();
          await user.save();
        }else if(leftActiveCount == 440){
          user.rankSalaryActivation[5] = true;
          user.rankSalaryActivation[4] = false;
          user.rankSalaryStartDate[5] = Date.now();
          await user.save();
        }else if(leftActiveCount == 940){
          user.rankSalaryActivation[6] = true;
          user.rankSalaryActivation[5] = false;
          user.rankSalaryStartDate[6] = Date.now();
          await user.save();
        }else if(leftActiveCount == 1940){
          user.rankSalaryActivation[7] = true;
          user.rankSalaryActivation[6] = false;
          user.rankSalaryStartDate[7] = Date.now();
          await user.save();
        }else if(leftActiveCount == 4440){
          user.rankSalaryActivation[8] = true;
          user.rankSalaryActivation[7] = false;
          user.rankSalaryStartDate[8] = Date.now();
          await user.save();
        }else if(leftActiveCount == 9440){
          user.rankSalaryActivation[9] = true;
          user.rankSalaryActivation[8] = false;
          user.rankSalaryStartDate[9] = Date.now();
          await user.save();
        }else if(leftActiveCount == 16940){
          user.rankSalaryActivation[10] = true;
          user.rankSalaryActivation[9] = false;
          user.rankSalaryStartDate[10] = Date.now();
          await user.save();
        }else if(leftActiveCount == 26940){
          user.rankSalaryActivation[11] = true;
          user.rankSalaryActivation[10] = false;
          user.rankSalaryStartDate[11] = Date.now();
          await user.save();
        }else if(leftActiveCount == 41940){
          user.rankSalaryActivation[12] = true;
          user.rankSalaryActivation[11] = false;
          user.rankSalaryStartDate[12] = Date.now();
          await user.save();
        }else if(leftActiveCount == 66940){
          user.rankSalaryActivation[13] = true;
          user.rankSalaryActivation[12] = false;
          user.rankSalaryStartDate[13] = Date.now();
          await user.save();
        }else if(leftActiveCount == 116940){
          user.rankSalaryActivation[14] = true;
          user.rankSalaryActivation[13] = false;
          user.rankSalaryStartDate[14] = Date.now();
          await user.save();
        }else if(leftActiveCount == 216940){
          user.rankSalaryActivation[15] = true;
          user.rankSalaryActivation[14] = false;
          user.rankSalaryStartDate[15] = Date.now();
          await user.save();
        }
      }
     }

    if (isMatchingPair) {
      // Update the user's matching income
      user.matchingIncome += 5;  // Add $5 to matching income
      user.hasReceivedFirstMatchingIncome = false;
      await user.save();

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


exports.activateUser = async (req, res) => {

  try {
    const { referralCode } = req.body;
    console.log('body ==>',req.body);

    // Find the user who is purchasing the package
    const user = await User.findOne({referralCode});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // console.log('user ==>',user);
    
    user.isActive = true;
    await user.save();

    const all_users = await User.find()
    let all_id=[];

    for(let i=0;i<all_users.length;i++){
      all_id.push(all_users[i]._id)
    } 
    console.log("alll_id--->",all_id);
    
    for(let i=0;i<all_id.length;i++){
      await calculateMatchingIncome(all_id[i])
      console.log("useraaaa===>",all_id[i])
    }
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
      console.log("level===========================", currentUser);
      
      // Fetch the referring user (upline) based on the referralCode
      const uplineUser = await User.findOne({
        referralCode: currentUser.referredBy,
      });

      console.log('uplineUser =======>',uplineUser);
      

      if (!uplineUser) {
        console.log(
          `No upline user found for referral code: ${currentUser.referredBy}`
        );
        levelMessages.push(`No upline found at level ${level + 1}`);
        break;
      }

      // Calculate the profit for the upline
      const profit = (60 * profitDistribution[level].percentage) / 100;

      // Add the profit to the upline's earning wallet
      uplineUser.earningWallet += profit;

      const newBotLevelIncome = new BotLevelIncome({
        user: uplineUser._id,
        fromUser: user._id,
        level: level,
        percentage: profitDistribution[level].percentage,
        amount: profit,
      })

      await newBotLevelIncome.save();

      await uplineUser.save();


      console.log("abc ==>",uplineUser.earningWallet);
      

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
      activateBy: 'admin',
    });


    console.log('hellooooooooooooooooooo');
    

    const newBullPurchsed = new BotPurchased({
      user: user._id,
      amount: 60,
      purchasedBy: "Admin"
    })

    await newBullPurchsed.save();

    
    await activation.save();

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
    res.status(500).json({ message: 'Server error', error });
  }
};



exports.updateWithdrawlPaymentStatus = async (req, res) => {
  // console.log("update withdraw status called=>",req.params);
  
  const { transactionId } = req.params; // Get the transaction ID from the request parameters
  const { paymentStatus } = req.body; // Get the new payment status from the request body

  try {
    // Validate the paymentStatus input
    const validStatuses = ['Processing', 'Approved', 'Canceled'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    // Find the transaction by its ID and update its payment status
    const updatedTransaction = await WithdrawPaymentRequest.findByIdAndUpdate(
      {_id:transactionId},
      { paymentStatus },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Respond with the updated transaction
    res.status(200).json({
      message: 'Payment status updated successfully',
      data: updatedTransaction
    });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Server error while updating payment status' });
  }
};

exports.getAllWithdrawRequests = async (req, res) => {
  try {
    // Fetch all withdrawal requests from the database
    const withdrawRequests = await WithdrawPaymentRequest.find();
    res.status(200).json(withdrawRequests);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ 
      error: 'There was an issue fetching withdrawal requests. Please try again.' 
    });
  }
};



exports.AdminRegister = async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    let admin = await AdminCredentials.findOne({ mobileNumber });
    if (admin) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }
    
    admin = new AdminCredentials({
      mobileNumber,
      password // Store the original password directly
    });
    await admin.save();
    res.status(201).json({ success: true, message: 'Admin registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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
      return res.status(404).json({ error: 'User not found' });
    }

    // Recursively find all downline users with their levels
    const findDownlines = async (referralCode, level) => {
      const downlines = await User.find({ referredBy: referralCode });
      let result = [];

      for (const downline of downlines) {
        const downlineUsers = await findDownlines(downline.referralCode, level + 1);
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
    console.log("result",result);
    

    res.status(200).send(result)  
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
  console.log("admin==>",req.body);
  try {
    const admin = await AdminCredentials.findOne({ mobileNumber });
    console.log("admin=>", admin);

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number or password' });
    }

    if (password !== admin.password) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number or password' });
    }

    const token = jwt.sign({ id: admin._id, mobileNumber: admin.mobileNumber }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        mobileNumber: admin.mobileNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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


exports.getAddDeductList = async(req,res) => {
  try {
    const  addDeductList = await AddTransaction.find();
    console.log("result",addDeductList);
    res.status(200).send(addDeductList) 
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
}