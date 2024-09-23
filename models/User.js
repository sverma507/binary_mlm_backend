const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  leftChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rightChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  wallet: { type: Number, default: 0 },  // Total amount in wallet
  directIncome: { type: Number, default: 0 },  // Direct bot income
  matchingIncome: { type: Number, default: 0 },  // Matching income
  salaryIncome: { type: Number, default: 0 },  // Salary income
  royaltyIncome: { type: Number, default: 0 },  // Royalty income
  tradingIncome: { type: Number, default: 0 },  // Trading profit income
  leadershipIncome: { type: Number, default: 0 },  // Leadership income
  stakingIncome: { type: Number, default: 0 },  // Staking income from coins
  rank: { type: String, default: 'None' },  // Rank (Alpha, Beta, etc.)
  isActive: { type: Boolean, default: false },  // Status of the user
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
