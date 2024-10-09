const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin.js');
const crypto = require('crypto');
const dotenv = require('dotenv');
const AdminCredentials = require('../models/Admin/Admin');
dotenv.config();

const generateReferralCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
  return `UTI${randomNumber}`;
};



const findAvailableSpot = async (userId, preferredSide) => {
  const queue = [userId];

  while (queue.length) {
      const currentUserId = queue.shift();
      const currentUser = await User.findById(currentUserId);

      if (preferredSide === 'left') {
          if (!currentUser.leftChild) {
              return { parent: currentUser, side: 'left' };
          }
          queue.push(currentUser.leftChild);
      } else if (preferredSide === 'right') {
          if (!currentUser.rightChild) {
              return { parent: currentUser, side: 'right' };
          }
          queue.push(currentUser.rightChild);
      }
  }

  return null;
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Log the request body for debugging
    console.log(req.body);

    const adminId = "66fb8fd9b6935ada42452aeb";

    // Fetch the admin from the database using the adminId, ensure you await this operation
    const admin = await AdminCredentials.findById(adminId);

    // Check if the admin was found
    if (!admin) {
      console.log('Admin not found');
      return res.status(404).send({
        message: "Admin not found" // Send proper error message if admin not found
      });
    }

    // Log the fetched admin for debugging
    console.log('Admin data:', admin);

    // Compare the provided old password with the stored password
    if (admin.password !== oldPassword) {
      return res.status(400).send({
        message: "Old password is incorrect" // Send specific error message if the old password is incorrect
      });
    }

    // Update the password with the new one
    admin.password = newPassword;
    await admin.save();

    // If successful, send a success message
    res.status(200).send({
      message: "Password changed successfully"
    });

  } catch (error) {
    // In case of any other error, log it and send a 500 response with the error message
    console.error('Error changing password:', error);

    res.status(500).send({
      message: "Something went wrong",
      error: error.message // Include the actual error message for debugging
    });
  }
};



// Register User with the updated placement
exports.signUp = async (req, res) => {
  try {
      const { name, email, password, referredBy, preferredSide, walletAddress} = req.body;

      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Validate referredBy code if provided
      if (referredBy) {
          const referrer = await User.findOne({ referralCode: referredBy });
          if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });

          // Find the next available spot based on preferred side
          const spot = await findAvailableSpot(referrer._id, preferredSide);
          if (!spot) return res.status(400).json({ message: `No available spot found on the ${preferredSide} side` });

          // Create the new user
          const newReferralCodec = generateReferralCode();
          const newUser = new User({
              name,
              email,
              walletAddress,
              password: password,
              referralCode: newReferralCodec,
              referredBy: referrer._id
          });

          await newUser.save();

          // Assign the new user to the chosen available spot
          if (spot.side === 'left') {
              spot.parent.leftChild = newUser._id;
          } else if (spot.side === 'right') {
              spot.parent.rightChild = newUser._id;
          }

          await spot.parent.save();

          res.status(201).json({ message: 'User registered successfully and assigned to the chosen side' });
      } else {
          res.status(400).json({ message: 'Referral code is required' });
      }
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.login = async (req, res) => {
  console.log("Login request data:", req.body);

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required.',
      });
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found. Please register.',
      });
    }

    if (user.blocked) {
      return res.status(400).json({
        success: false,
        message: 'You are blocked by the admin. Contact admin for assistance.',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user,
      token,
    });

  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again later.',
    });
  }
};


exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    
    const admin = await Admin.findOne({ email });
    if (!admin || password !== admin.password) {  // Compare original password
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.forgotPasswordController = async (req, res) => {
  try {
    const { mobileNumber, answer, newPassword } = req.body;
    if (!mobileNumber) {
      return res.status(400).send({ message: "Phone is required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      return res.status(400).send({ message: "New password is required" });
    }

    const user = await User.findOne({ mobileNumber, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong phone number or answer"
      });
    }

    // Update the password without hashing
    await User.findByIdAndUpdate(user._id, { password: newPassword.trim() });

    res.status(200).send({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error
    });
  }
};
