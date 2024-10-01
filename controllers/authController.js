const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin.js');
const crypto = require('crypto');
const dotenv = require('dotenv');
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

  console.log("data===>",req.body);
  
  try {
    const { mobileNumber, email, password } = req.body;
    const user = await User.findOne(mobileNumber ? { mobileNumber } : { email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Validate password
    if (password.trim() !== user.password) {  // Compare original password
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    if (user.blocked) {
      return res.status(400).json({
        success: false,
        message: 'You Are Blocked By Admin. Contact Admin.',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user :user,
      token,
    });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({
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
