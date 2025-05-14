const express = require('express');
const { createTransaction, getTransactions, processRecurringTransactionController, exportTransactions, allocateSavings, generateDetailedReport  } = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/transactions', authMiddleware, createTransaction);
router.get('/transactions', authMiddleware, getTransactions);

router.post('/transactions/recurring/:userID', authMiddleware, processRecurringTransactionController);  


router.get('/transactions/export', authMiddleware, exportTransactions);  


router.post('/transactions/allocate-savings', authMiddleware, allocateSavings); 


router.get('/transactions/reports/detailed', authMiddleware, generateDetailedReport);  


module.exports = router;
