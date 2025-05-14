const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { encrypt, decrypt } = require('../utils/encryption'); 

// Create a budget
const createBudget = async (req, res) => {
  const { category, amount } = req.body;
  try {
    const budget = new Budget({ userId: req.user.id, category, amount });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all budgets for a user
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Notify if the user exceeds their budget
const checkBudgetExceeding = async (userId) => {
  try {
    const budgets = await Budget.find({ userId });

    for (const budget of budgets) {
      try {
        const transactions = await Transaction.find({ userId, category: budget.category });

        let totalSpent = 0;
        // Decrypt each transaction amount before summing it
        transactions.forEach((transaction) => {
          totalSpent += parseFloat(decrypt(transaction.amount)); // Decrypt and add the amount
        });

        if (totalSpent > budget.amount) {
          const notification = new Notification({
            userId,
            message: `You have exceeded your budget for ${budget.category}`,
            type: 'alert',
          });
          await notification.save(); // Save the notification
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = { createBudget, getBudgets, checkBudgetExceeding };
