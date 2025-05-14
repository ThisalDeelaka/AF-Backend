const Transaction = require('../models/Transaction');
const { parse } = require('json2csv');
const { processRecurringTransaction } = require('../utils/recurringTransaction');
const Goal = require('../models/Goal');
const cron = require('node-cron');
const validateTags = require('../utils/tagValidation');
const { encrypt, decrypt } = require('../utils/encryption');  
const { getExchangeRate } = require('../utils/currencyUtils');  
const { checkBudgetExceeding } = require('../controllers/budgetController'); 
const { updateGoalProgress } = require('../controllers/goalController');

const createTransaction = async (req, res) => {
  const {
    amount,
    category,
    tags,
    type,
    originalCurrency,
    exchangeRate,
    recurrence,
    startDate,
    endDate,
    targetCurrency
  } = req.body;

  // Validate tags
  if (!validateTags(tags)) {
    return res.status(400).json({ message: 'Invalid tag format. Tags can only contain letters, numbers, and underscores.' });
  }

  try {
    // Convert currency
    let amountInTargetCurrency = amount;
    if (targetCurrency && originalCurrency !== targetCurrency) {
      const conversionRate = await getExchangeRate(originalCurrency, targetCurrency); // Fetch conversion rate
      amountInTargetCurrency = amount * conversionRate; // Convert the amount to the target currency
    }

    // Encrypt the transaction amount before saving it
    const encryptedAmount = encrypt((amountInTargetCurrency * exchangeRate).toString()); // Convert amount to string and encrypt

    // Create the transaction record
    const transaction = new Transaction({
      userId: req.user.id,
      amount: encryptedAmount, // Store the encrypted amount as a string
      category,
      tags,
      type,
      originalCurrency,
      exchangeRate,
      recurrence,
      startDate,
      endDate,
    });

    await transaction.save(); // Save the transaction to the database

    // Call checkBudgetExceeding to check if the user's spending exceeds their budget
    await checkBudgetExceeding(req.user.id); // Ensure this is awaited

    // Call updateGoalProgress to check if any goals are achieved
    await updateGoalProgress(req.user.id); // Check and update the goal progress for this user

    res.status(201).json(transaction); // Return the transaction response
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error handling
  }
};

// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    // Decrypt the amount for each transaction before sending the response
    transactions.forEach((transaction) => {
      transaction.amount = decrypt(transaction.amount);  // Decrypt the stored amount
    });

    res.json(transactions);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Allocate savings based on 10% of the user's income
const allocateSavings = async (userId, amount) => {
  const savingsPercentage = 10;  // Allocate 10% of income to goals
  const savingsAmount = (savingsPercentage / 100) * amount;

  const goal = await Goal.findOne({ userId, isAchieved: false });
  if (goal) {
    goal.currentAmount += savingsAmount;
    await goal.save();
  }
};

const processRecurringTransactionController = async (req, res) => {
  try {
    // Use req.user.id to ensure a valid userId is included
    const transactionData = { ...req.body, userId: req.user.id };
    await processRecurringTransaction(transactionData); // Process the recurring transaction
    res.status(200).json({ message: "Recurring transaction processed successfully." });
  } catch (err) {
    res.status(400).json({ message: "Error processing recurring transaction." });
  }
};




// Export transactions as CSV
const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    
    transactions.forEach((transaction) => {
      transaction.amount = decrypt(transaction.amount); 
    });

    // Format the transactions data for CSV 
    const formattedTransactions = transactions.map((transaction) => ({
      _id: transaction._id,
      userId: transaction.userId,
      amount: transaction.amount,
      category: transaction.category,
      tags: transaction.tags.join(', '), // Join tags array as a string
      type: transaction.type,
      originalCurrency: transaction.originalCurrency,
      exchangeRate: transaction.exchangeRate,
      recurrence: transaction.recurrence,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      date: transaction.date,
      __v: transaction.__v,
    }));

    // Convert transactions to CSV format
    const csv = parse(formattedTransactions);

    // Set the CSV headers and send the response
    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.send(csv);

  } catch (err) {
    res.status(500).json({ message: 'Error exporting transactions.' });
  }
};


// Admin generates a report with filters for date, category, etc.
const generateDetailedReport = async (req, res) => {
  const { startDate, endDate, category } = req.query;

  try {
    const report = await Transaction.aggregate([
      { $match: { userId: req.user.id, date: { $gte: new Date(startDate), $lte: new Date(endDate) }, category } },
      { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } },
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  allocateSavings,
  generateDetailedReport,
  processRecurringTransactionController,
  exportTransactions
};
