const express = require('express');
const { createBudget, getBudgets, checkBudgetExceeding } = require('../controllers/budgetController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/budgets', authMiddleware, createBudget);
router.get('/budgets', authMiddleware, getBudgets);
router.post('/budgets/check', authMiddleware, checkBudgetExceeding);

module.exports = router;
