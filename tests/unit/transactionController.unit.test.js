// __tests__/unit/transactionController.unit.test.js
const transactionController = require("../../controllers/transactionController");
const Transaction = require("../../models/Transaction");
const Goal = require("../../models/Goal");
const { processRecurringTransaction } = require("../../utils/recurringTransaction");
const cron = require("node-cron");
const { parse } = require("json2csv");
const { encrypt, decrypt } = require("../../utils/encryption");

// Import the mocked budget and goal controllers for verification
const { checkBudgetExceeding } = require("../../controllers/budgetController");
const { updateGoalProgress } = require("../../controllers/goalController");

// Mock dependencies
jest.mock("../../models/Transaction");
jest.mock("../../models/Goal");
jest.mock("../../utils/recurringTransaction");
jest.mock("node-cron");
jest.mock("json2csv");

// Mock encryption as a passthrough for testing
jest.mock("../../utils/encryption", () => ({
  encrypt: jest.fn((val) => val),
  decrypt: jest.fn((val) => val),
}));

// Mock the additional controller functions
jest.mock("../../controllers/budgetController", () => ({
  checkBudgetExceeding: jest.fn().mockResolvedValue(),
}));
jest.mock("../../controllers/goalController", () => ({
  updateGoalProgress: jest.fn().mockResolvedValue(),
}));

describe("Transaction Controller - Create Transaction", () => {
  it("should create a new transaction and return it", async () => {
    const req = {
      body: {
        amount: 1000,
        category: "Food",
        tags: ["groceries"],
        type: "expense",
        originalCurrency: "USD",
        exchangeRate: 1.2,
        recurrence: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
      user: { id: "user123" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Since no targetCurrency is provided, amountInTargetCurrency remains 1000.
    // Multiply by exchangeRate: 1000 * 1.2 = 1200, converted to string "1200", then encrypted (passthrough).
    const fakeTransaction = {
      _id: "1",
      userId: "user123",
      amount: "1200", // expected encrypted amount (as a string)
      category: "Food",
      tags: ["groceries"],
      type: "expense",
      originalCurrency: "USD",
      exchangeRate: 1.2,
      recurrence: "monthly",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      save: jest.fn().mockResolvedValueOnce(true),
    };

    Transaction.mockImplementationOnce(() => fakeTransaction);

    await transactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeTransaction);
    // Verify that the additional functions are called with the correct userId
    expect(checkBudgetExceeding).toHaveBeenCalledWith("user123");
    expect(updateGoalProgress).toHaveBeenCalledWith("user123");
  });

  it("should return error if transaction creation fails", async () => {
    const req = {
      body: {
        amount: 1000,
        category: "Food",
        tags: ["groceries"],
        type: "expense",
        originalCurrency: "USD",
        exchangeRate: 1.2,
        recurrence: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      },
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Transaction creation failed";
    const fakeTransaction = {
      save: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    };
    Transaction.mockImplementationOnce(() => fakeTransaction);

    await transactionController.createTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe("Transaction Controller - Get Transactions", () => {
  it("should return all transactions for a user", async () => {
    const req = {
      user: { id: "user123" },
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    const fakeTransactions = [
      {
        _id: "1",
        userId: "user123",
        amount: "1000", // Encrypted amount (as string)
        category: "Food",
        tags: ["groceries"],
        type: "expense",
      },
      {
        _id: "2",
        userId: "user123",
        amount: "500",
        category: "Transport",
        tags: ["bus"],
        type: "expense",
      },
    ];

    Transaction.find.mockResolvedValueOnce(fakeTransactions);

    await transactionController.getTransactions(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeTransactions);
  });

  it("should return error if fetching transactions fails", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Fetching transactions failed";
    Transaction.find.mockRejectedValueOnce(new Error(errorMessage));

    await transactionController.getTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe("Transaction Controller - Allocate Savings", () => {
  it("should allocate savings to the goal", async () => {
    const userId = "user123";
    const amount = 2000;

    const fakeGoal = {
      _id: "1",
      userId,
      name: "Save for Car",
      targetAmount: 10000,
      currentAmount: 2000,
      isAchieved: false,
      save: jest.fn().mockResolvedValueOnce(true),
    };

    Goal.findOne.mockResolvedValueOnce(fakeGoal);

    await transactionController.allocateSavings(userId, amount);

    // 10% of 2000 is 200; currentAmount should become 2200
    expect(fakeGoal.currentAmount).toBe(2200);
    expect(fakeGoal.save).toHaveBeenCalled();
  });

  it("should not allocate savings if goal is not found", async () => {
    const userId = "user123";
    const amount = 2000;

    Goal.findOne.mockResolvedValueOnce(null);

    await transactionController.allocateSavings(userId, amount);

    expect(Goal.findOne).toHaveBeenCalled();
  });
});

describe("Transaction Controller - Process Recurring Transaction", () => {
  // Updated: Using req.user instead of req.params
  it("should process a recurring transaction", async () => {
    const req = {
      user: { id: "user123" },
      body: {
        amount: 1000,
        category: "Savings",
        type: "income",
        recurrence: "monthly",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    processRecurringTransaction.mockResolvedValueOnce(true);

    await transactionController.processRecurringTransactionController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Recurring transaction processed successfully.",
    });
  });

  it("should handle errors in processing recurring transaction", async () => {
    const req = {
      user: { id: "user123" },
      body: {
        amount: 1000,
        category: "Savings",
        type: "income",
        recurrence: "monthly",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    processRecurringTransaction.mockRejectedValueOnce(
      new Error("Error processing recurring transaction.")
    );

    await transactionController.processRecurringTransactionController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error processing recurring transaction.",
    });
  });
});

describe("Transaction Controller - Export Transactions", () => {
  it("should export transactions as CSV", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      header: jest.fn().mockReturnThis(),
      attachment: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const fakeTransactions = [
      {
        _id: "1",
        userId: "user123",
        amount: "1000",
        category: "Food",
        tags: ["groceries"],
        type: "expense",
        originalCurrency: "USD",
        exchangeRate: 1.2,
        recurrence: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        date: new Date(),
        __v: 0,
      },
    ];

    Transaction.find.mockResolvedValueOnce(fakeTransactions);
    parse.mockReturnValueOnce("csv-data");

    await transactionController.exportTransactions(req, res);

    expect(res.header).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.attachment).toHaveBeenCalledWith("transactions.csv");
    expect(res.send).toHaveBeenCalledWith("csv-data");
  });

  it("should handle errors in exporting transactions", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Error exporting transactions.";
    Transaction.find.mockRejectedValueOnce(new Error(errorMessage));

    await transactionController.exportTransactions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe("Transaction Controller - Generate Detailed Report", () => {
  it("should generate a detailed report", async () => {
    const req = {
      query: {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        category: "Food",
      },
      user: { id: "user123" },
    };
    const res = {
      json: jest.fn(),
    };

    const fakeReport = [{ _id: "Food", totalSpent: 5000 }];

    Transaction.aggregate.mockResolvedValueOnce(fakeReport);

    await transactionController.generateDetailedReport(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeReport);
  });

  it("should handle errors in generating the detailed report", async () => {
    const req = {
      query: {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        category: "Food",
      },
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Transaction.aggregate.mockRejectedValueOnce(new Error("Server error"));

    await transactionController.generateDetailedReport(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: "Server error" });
  });
});
