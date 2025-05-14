const express = require('express');
const { createGoal, getGoals, updateGoalProgress, sendGoalReminder } = require('../controllers/goalController');

const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/goals', authMiddleware, createGoal);
router.get('/goals', authMiddleware, getGoals);
router.post('/goals/update-progress', authMiddleware, updateGoalProgress);  

router.post('/goals/send-reminder', authMiddleware, sendGoalReminder);

module.exports = router;
