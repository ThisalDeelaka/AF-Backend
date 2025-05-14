const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['income', 'expense'], required: true },
  originalCurrency: { type: String, required: true },
  exchangeRate: { type: Number, required: true },
  recurrence: { type: String, enum: ['1min','daily', 'weekly', 'monthly'], default: 'monthly' },
  startDate: { type: Date },
  endDate: { type: Date },
});

module.exports = mongoose.model('Transaction', transactionSchema);
