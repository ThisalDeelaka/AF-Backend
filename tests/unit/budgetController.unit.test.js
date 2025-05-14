// __tests__/unit/budgetController.unit.test.js
const Budget = require('../../models/Budget');
const Notification = require('../../models/Notification');
const Transaction = require('../../models/Transaction');
const { createBudget, getBudgets, checkBudgetExceeding } = require('../../controllers/budgetController');
const { encrypt, decrypt } = require('../../utils/encryption');

// Mock necessary modules
jest.mock('../../models/Budget');
jest.mock('../../models/Notification');
jest.mock('../../models/Transaction');
jest.mock('../../utils/encryption');

describe('Budget Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for createBudget
  describe('createBudget', () => {
    it('should create a budget and respond with 201', async () => {
      const req = {
        user: { id: 'user123' },
        body: { category: 'food', amount: 100 }
      };

      const budgetMock = {
        _id: 'budget1',
        userId: req.user.id,
        category: req.body.category,
        amount: req.body.amount,
        save: jest.fn().mockResolvedValue()
      };

      // When a new Budget is created, return our fake instance.
      Budget.mockImplementation(() => budgetMock);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createBudget(req, res);

      expect(budgetMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(budgetMock);
    });

    it('should respond with 400 when budget creation fails', async () => {
      const req = {
        user: { id: 'user123' },
        body: { category: 'food', amount: 100 }
      };

      const error = new Error('Budget creation error');
      const budgetMock = {
        save: jest.fn().mockRejectedValue(error)
      };

      Budget.mockImplementation(() => budgetMock);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  // Tests for getBudgets
  describe('getBudgets', () => {
    it('should return budgets in json format', async () => {
      const req = { user: { id: 'user123' } };
      const budgets = [
        { _id: 'budget1', userId: 'user123', category: 'food', amount: 100 }
      ];
      Budget.find.mockResolvedValue(budgets);

      const res = { json: jest.fn() };

      await getBudgets(req, res);

      expect(Budget.find).toHaveBeenCalledWith({ userId: req.user.id });
      expect(res.json).toHaveBeenCalledWith(budgets);
    });

    it('should respond with 400 when fetching budgets fails', async () => {
      const req = { user: { id: 'user123' } };
      const error = new Error('Get budgets error');
      Budget.find.mockRejectedValue(error);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getBudgets(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  // Tests for checkBudgetExceeding
  describe('checkBudgetExceeding', () => {
    it('should send a notification when the budget is exceeded', async () => {
      const userId = 'user123';
      const budgetData = [
        { _id: 'budget1', userId, category: 'food', amount: 100 }
      ];
      Budget.find.mockResolvedValue(budgetData);

      // For category "food", return one transaction whose amount (after decryption) is 150
      const transactionsData = [
        { _id: 'tx1', userId, category: 'food', amount: '150' }
      ];
      Transaction.find.mockResolvedValueOnce(transactionsData);
      // Make decryption a passthrough for testing.
      decrypt.mockImplementation((val) => val);

      const saveMock = jest.fn().mockResolvedValue();
      Notification.mockImplementation(() => ({ save: saveMock }));

      await checkBudgetExceeding(userId);

      expect(Notification).toHaveBeenCalledWith({
        userId,
        message: `You have exceeded your budget for food`,
        type: 'alert'
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it('should not send a notification when the budget is not exceeded', async () => {
      const userId = 'user123';
      const budgetData = [
        { _id: 'budget1', userId, category: 'entertainment', amount: 200 }
      ];
      Budget.find.mockResolvedValue(budgetData);

      const transactionsData = [
        { _id: 'tx1', userId, category: 'entertainment', amount: '150' }
      ];
      Transaction.find.mockResolvedValueOnce(transactionsData);
      decrypt.mockImplementation((val) => val);

      await checkBudgetExceeding(userId);

      // No notification should be created if total spent is within the budget.
      expect(Notification).not.toHaveBeenCalled();
    });

    it('should log error when Budget.find fails', async () => {
      const userId = 'user123';
      const error = new Error('Error in Budget.find');
      Budget.find.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await checkBudgetExceeding(userId);
      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });

    it('should log error when Transaction.find fails for a budget', async () => {
      const userId = 'user123';
      const budgetData = [
        { _id: 'budget1', userId, category: 'travel', amount: 300 }
      ];
      Budget.find.mockResolvedValue(budgetData);
      const error = new Error('Error in Transaction.find');
      Transaction.find.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await checkBudgetExceeding(userId);
      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });
});
