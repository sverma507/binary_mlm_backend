const mongoose = require("mongoose");

const TradingIncomePercentSchema = new mongoose.Schema({
  percent: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('TradingIncomePercent', TradingIncomePercentSchema);