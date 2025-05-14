const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'reminder'], required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model('Notification', notificationSchema);
