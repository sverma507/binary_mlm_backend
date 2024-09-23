const mongoose = require('mongoose');

const gameIncomeTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prize: { type: Number, required: true },
  game: { type: String},
  type: {type: String}
}, { timestamps: true });

module.exports = mongoose.model('GameIncomeTransaction', gameIncomeTransactionSchema);