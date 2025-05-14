const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  isAchieved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Goal', goalSchema);
