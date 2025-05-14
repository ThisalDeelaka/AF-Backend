const Notification = require('../models/Notification');


// Create a new notification
const createNotification = async (req, res) => {
  const { message, type } = req.body;

  if (!message || !type) {
    return res.status(400).json({ message: 'Message and type are required' });
  }

  try {
    const notification = new Notification({
      userId: req.user.id, 
      message,
      type,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createNotification, getNotifications, markAsRead, deleteNotification };
