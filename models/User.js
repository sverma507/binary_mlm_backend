const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required:true },
  // password: { type: String, required: true },
  referralCode: { type: String, unique: true},
  referredBy: { type: String },
  walletAddress: { type: String , required:true},
  leftChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // tradingWallet: { type: Number, default:0 },
  rightChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rankSalaryActivation: {
    type: [Boolean], 
    default: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  },
  rankSalaryStartDate: {
    type: [Date], 
    default: [
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0),
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0),
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0), 
      new Date().setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0)
    ]
  },
  earningWallet: { type: Number, default: 0 },  // Total amount in wallet
  rechargeWallet:{ type: Number, default: 0 },
  matchingWallet:{ type: Number, default: 0 },
  tradingWallet:{ type: Number, default: 0 },
  tradingWithdrawlCount:{ type: Number, default: 0 },
  bullWallet:{ type: Number, default: 0 },
  bullWithdrawlCount:{ type: Number, default: 0 },
  directIncome: { type: Number, default: 0 },  // Direct bot income
  matchingIncome: { type: Number, default: 0 },  // Matching income
  salaryIncome: { type: Number, default: 0 },  // Salary income
  royaltyIncome: { type: Number, default: 0 },  // Royalty income
  tradingIncome: { type: Number, default: 0 },  // Trading profit income
  leadershipIncome: { type: Number, default: 0 },  // Leadership income
  stakingIncome: { type: Number, default: 0 },  // Staking income from coins
  matchingIncome:{type:Number, default:0},
  blocked: { type: Boolean, default: false },
  rank: { type: String, default: 'None' },  // Rank (Alpha, Beta, etc.)
  hasReceivedFirstMatchingIncome: { type: Boolean, default: false },
  matchedPairs: {
    type: [{ leftUserId: String, rightUserId: String, level: Number }],
    default: []
  },  // Status of the user
  isActive: { type: Boolean, default: false },  // Status of the user
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
