const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { encrypt, decrypt } = require('../utils/encryption'); 


// Create a financial goal
const createGoal = async (req, res) => {
  const { name, targetAmount, dueDate } = req.body;
  try {
    const goal = new Goal({ userId: req.user.id, name, targetAmount, dueDate });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all goals for a user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Track progress toward a goal
const updateGoalProgress = async (userId) => {
  try {
    const goals = await Goal.find({ userId }); 

  
    const totalSavedAgg = await Transaction.aggregate([
      { $match: { userId, category: 'Savings' } },
      { $group: { _id: 'Savings', totalSaved: { $sum: '$amount' } } },
    ]);

    const totalSaved = totalSavedAgg[0]?.totalSaved || 0;

    for (const goal of goals) {
      const progress = (totalSaved / goal.targetAmount) * 100;
      goal.currentAmount = totalSaved; 

    
      if (progress >= 100 && !goal.isAchieved) {
        goal.isAchieved = true;

       
        const notification = new Notification({
          userId,
          message: `Congratulations! You've reached your goal of ${goal.name}`,
          type: 'reminder',
        });
        await notification.save(); 
      }

      await goal.save(); 
    }
  } catch (err) {
    
  }
};



const sendGoalReminder = async (req, res, next) => {
  const { userId } = req.user;  
  try {
    const goals = await Goal.find({ userId, isAchieved: false });

    goals.forEach(async (goal) => {
      const dueDate = new Date(goal.dueDate);
      const currentDate = new Date();

      // If the goal's due date is within the next 7 days, send a reminder
      if (dueDate - currentDate <= 7 * 24 * 60 * 60 * 1000) {
        const notification = new Notification({
          userId,
          message: `Reminder: Your goal '${goal.name}' is due soon!`,
          type: 'reminder',
        });
        await notification.save();
      }
    });

    res.status(200).json({ message: 'Goal reminder sent successfully.' });
  } catch (err) {
    
    next(err); 
  }
};



module.exports = { createGoal, getGoals, updateGoalProgress, sendGoalReminder };
