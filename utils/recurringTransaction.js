const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');


const calculateNextRecurrence = (lastDate, recurrence) => {
  const nextDate = new Date(lastDate);
  switch (recurrence) {
    case '1min':
      nextDate.setMinutes(nextDate.getMinutes() + 1);
      break;
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      throw new Error('Invalid recurrence type');
  }
  return nextDate;
};

// Function to send notifications to users about recurring transactions
const sendRecurringNotification = async (userId, message) => {
  const notification = new Notification({
    userId,
    message,
    type: 'reminder',
  });
  await notification.save();
};

// Function to process the recurring transaction
const processRecurringTransaction = async (transaction) => {
  const {
    recurrence,
    startDate,
    endDate,
    amount,
    category,
    tags,
    type,
    userId,
    originalCurrency,
    exchangeRate,
  } = transaction;

  const currentDate = new Date();

  if (currentDate < new Date(startDate)) {
    console.log('Recurring transaction start date has not yet arrived');
    return;
  }

  if (endDate && currentDate > new Date(endDate)) {
    console.log('Recurring transaction period has ended');
    return;
  }

  const transactionData = {
    userId,
    amount: amount * exchangeRate,
    category,
    tags,
    type,
    originalCurrency,
    exchangeRate,
    date: currentDate,
    startDate,
    endDate,
    exchangeRate,
    recurrence
  };

  try {
    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();
    console.log('Recurring transaction created for:', transactionData.category);

    const notificationMessage = `Recurring transaction for ${category} created. Amount: ${amount * exchangeRate}`;
    await sendRecurringNotification(userId, notificationMessage);
  } catch (err) {
    console.error('Error processing recurring transaction:', err.message);
  }

  const nextDate = calculateNextRecurrence(currentDate, recurrence);
  scheduleNextRecurringTransaction(transaction, nextDate);
};

// Function to schedule the next recurring transaction
const scheduleNextRecurringTransaction = (transaction, nextDate) => {
  const delay = nextDate.getTime() - new Date().getTime();
  if (delay <= 0) {
    console.log('Next recurrence time has already passed');
    return;
  }

  setTimeout(() => {
    processRecurringTransaction(transaction);
  }, delay);
};

// Only schedule cron job outside of test environment
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Processing recurring transactions...');

    try {
      const recurringTransactions = await Transaction.find({
        recurrence: { $in: ['daily', 'weekly', 'monthly'] },
        nextDueDate: { $lte: new Date() },
      });

      for (let transaction of recurringTransactions) {
        await processRecurringTransaction(transaction);
      }
    } catch (err) {
      console.error('Error in cron job for recurring transactions:', err.message);
    }
  });
}

module.exports = {
  processRecurringTransaction,
  scheduleNextRecurringTransaction,
};
