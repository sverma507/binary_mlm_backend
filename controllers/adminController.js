const User = require('../models/User');
const Package = require('../models/Package');
const jwt = require('jsonwebtoken');
const AdminCredentials = require('../models/Admin/Admin');
const JWT_SECRET = process.env.JWT_SECRET;
const Product = require('../models/addPackage');
const WithdrawPaymentRequest = require('../models/withdrawPaymentRequest');
const ActivationTransaction = require('../models/activationTransaction');


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

