const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Package = require('../models/Package');
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const Payments =require('../models/payment')
const AdminCredentials = require('../models/Admin/Admin');
const JWT_SECRET = process.env.JWT_SECRET;
const Product = require('../models/addPackage');
const WithdrawPaymentRequest = require('../models/withdrawPaymentRequest');
const { calculateDailyReferralProfits } = require('./userController');
const ActivationTransaction = require('../models/activationTransaction');
const upiDeposite = require('../models/upiDeposite');
const QrPaymentRequest = require('../models/qrPayment'); 
// const activationTransaction = require('../models/activationTransaction');



// Controller to handle approving a QR payment
exports.approveQRPayment = async (req, res) => {
  try {
    const { transactionId,userId } = req.body;
    console.log("======>",userId)

    const user=await User.findById(userId)
    const transaction = await QrPaymentRequest.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ status: false, message: "Transaction not found" });
    }

    user.rechargeWallet +=transaction.amount;
    await user.save();
    transaction.paymentStatus = "Approved";

    await transaction.save();

    res.status(200).json({ status: true, message: "Transaction approved successfully" });
  } catch (error) {
    console.error("Error approving QR payment", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Controller to handle rejecting a QR payment
exports.rejectQRPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await QrPaymentRequest.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ status: false, message: "Transaction not found" });
    }

    transaction.paymentStatus = "Rejected";
    await transaction.save();

    res.status(200).json({ status: true, message: "Transaction rejected successfully" });
  } catch (error) {
    console.error("Error rejecting QR payment", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};




exports.getAllQrPaymentRequests=async (req,res) =>{
    try { 
  

      const transactions = await QrPaymentRequest.find();
  
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
        message: 'All Processing Requests',
        data: transactions,
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve All Requests.',
        error: error.message,
      });
    }
  
}


exports.getTotalINRCollection=async (req,res) =>{
  try{
    const result =await upiDeposite.find({status:"success"})
    if (!result ) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(result);

  }catch(err){
    console.log("error in  getting all the transcation of upi deposite");
    res.status(500).json({ message: 'Server error while get all transcation from upi deposite'});
  }
}

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

exports.ALLFundRequests=async(req,res)=>{
 try{
  const result=await Payments.find()
  console.log("admin payments=>",result);
  res.status(200).send(result)
  
 }catch(err){
  console.log(err);
  
 }
}




exports.UpdatePaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params; // Get the transaction ID from the request parameters
    const { paymentStatus } = req.body; // Get the new payment status from the request body

    // Find the transaction by its ID and update its payment status
    const updatedTransaction = await Payments.findByIdAndUpdate(
      transactionId,
      { paymentStatus: paymentStatus },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).send({ message: "Transaction not found" });
    }

    console.log("Updated transaction=>", updatedTransaction);
    res.status(200).send(updatedTransaction);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error updating payment status" });
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
    const users = await User.find({ active: true }).lean();
    const userIds = users.map(user => user._id);

    // Fetch packages for each user
    const packages = await Product.find({
      _id: { $in: users.flatMap(user => user.packages) } // Get all package IDs
    }).lean();

    // Create a map of package IDs to package details
    const packageMap = new Map(packages.map(pkg => [pkg._id.toString(), pkg]));

    // Attach package details to each user
    const usersWithPackages = users.map(user => ({
      ...user,
      packages: user.packages.map(pkgId => packageMap.get(pkgId.toString())) // Map package IDs to package details
    }));

    res.status(200).json(usersWithPackages);
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


exports.getAllBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ blocked: true });
    res.status(200).json(users);
  } catch (err) {
    console.log("no user");
    res.status(400).json({ error: err.message });
  }
};

exports.activateUser = async (req, res) => {
  // const { referralCode, packageId } = req.body;
  // console.log("req.body====>", req.body);

  try {
    const { packageId, referralCode } = req.body;
    // console.log('body ==>',req.body);
    
    // Find the package by ID
    const packageData = await Product.findById(packageId);
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }
    // console.log(packageData);
    

    // Find the user who is purchasing the package
    const user = await User.findOne({referralCode});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // console.log('user ==>',user);
    
    user.active = true;
    // console.log("user,spin=>",user.spinCount);
    user.spinCount += 1;
    user.packages.push(packageData);
    user.purchaseDate.push(Date.now());
    user.claimBonus.push(false);
    user.myRoi.push(0);

    await user.save();

    const activation = new ActivationTransaction({
      user: user.referralCode,
      email: user.email,
      mobileNumber: user.mobileNumber,
      activateBy: 'admin',
      package:packageData.name,
      packagePrice:packageData.price  
    });
    // console.log('income ==>',profitTransaction);
    
    await activation.save();
    // await calculateDailyReferralProfits(user._id);
    res.status(200).json({ message: 'User activated and package assigned', user });
    // console.log({ message: 'User activated and package assigned', user });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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

exports.updateUserBlockedStatus = async (req, res) => {
  const { id } = req.params;
  const { blocked } = req.body;

  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.blocked = blocked;
    await user.save();

    res.status(200).json({ success: true, message: `User ${blocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
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
        user.wallet += Number(amount);
        user.totalEarning += Number(amount);
      }
    } else {
      if (walletType === 'r-wallet') {
        user.rechargeWallet -= Number(amount);
      } else {
        user.wallet -= Number(amount);
      }
    }

    console.log("userWallet ==>", user);
    console.log(`user.id => ${user._id}, amount => ${amount}, type => ${transactionType}`);

    await user.save();

    const transaction = new Transaction({
      user: user._id,
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

exports.getAllUnPaidUsers = async (req, res) => {
  try {
    const users = await User.find({ active: false });
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

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user');
    res.status(200).json(transactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.managePackages = async (req, res) => {
  try {
    const { name, price, photo1, photo2, description, purchaseDate, supply, user } = req.body;
    const newPackage = new Package({ name, price, photo1, photo2, description, purchaseDate, supply, user });
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

