const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  timeframe: { type: String, enum: ['monthly'], default: 'monthly' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Budget', budgetSchema);
