const express = require('express');
const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/notifications', authMiddleware, createNotification);


router.get('/notifications', authMiddleware, getNotifications);


router.patch('/notifications/:notificationId/read', authMiddleware, markAsRead);


router.delete('/notifications/:notificationId', authMiddleware, deleteNotification);

module.exports = router;
