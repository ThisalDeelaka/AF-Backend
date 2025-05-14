const goalController = require("../../controllers/goalController");
const Goal = require("../../models/Goal");
const Transaction = require("../../models/Transaction");
const Notification = require("../../models/Notification");

jest.mock("../../models/Goal");
jest.mock("../../models/Transaction");
jest.mock("../../models/Notification");

describe("Goal Controller - Create Goal", () => {
  it("should create a new goal and return it", async () => {
    const req = {
      body: {
        name: "Save for Car",
        targetAmount: 10000,
        dueDate: "2025-12-31",
      },
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const fakeGoal = {
      _id: "1",
      userId: "user123",
      name: "Save for Car",
      targetAmount: 10000,
      dueDate: "2025-12-31",
      save: jest.fn().mockResolvedValueOnce(true),
    };

    Goal.mockImplementationOnce(() => fakeGoal);

    await goalController.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeGoal);
  });

  it("should return error if goal creation fails", async () => {
    const req = {
      body: {
        name: "Save for Car",
        targetAmount: 10000,
        dueDate: "2025-12-31",
      },
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Goal creation failed";
    const fakeGoal = {
      save: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    };
    Goal.mockImplementationOnce(() => fakeGoal);

    await goalController.createGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe("Goal Controller - Get Goals", () => {
  it("should return all goals for a user", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      json: jest.fn(),
    };

    const fakeGoals = [
      {
        _id: "1",
        userId: "user123",
        name: "Save for Car",
        targetAmount: 10000,
        dueDate: "2025-12-31",
      },
      {
        _id: "2",
        userId: "user123",
        name: "Save for Vacation",
        targetAmount: 5000,
        dueDate: "2025-06-30",
      },
    ];

    Goal.find.mockResolvedValueOnce(fakeGoals);

    await goalController.getGoals(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeGoals);
  });

  it("should return error if fetching goals fails", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Fetching goals failed";
    Goal.find.mockRejectedValueOnce(new Error(errorMessage));

    await goalController.getGoals(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe("Goal Controller - Update Goal Progress", () => {
  it("should create a notification if the goal is achieved", async () => {
    const userId = "user123";

    const fakeGoal = {
      _id: "1",
      userId,
      name: "Save for Car",
      targetAmount: 10000,
      currentAmount: 0,
      isAchieved: false,
      save: jest.fn().mockResolvedValue(true),
    };

    Goal.find.mockResolvedValueOnce([fakeGoal]);

    Transaction.aggregate.mockResolvedValueOnce([{ totalSaved: 10000 }]);

    const mockNotificationSave = jest.fn().mockResolvedValue({});
    Notification.mockImplementation(() => ({
      save: mockNotificationSave,
    }));

    await goalController.updateGoalProgress(userId);

    expect(mockNotificationSave).toHaveBeenCalled();
    expect(fakeGoal.save).toHaveBeenCalled();
    expect(fakeGoal.isAchieved).toBe(true);
  });

  it("should not create a notification if the goal is not achieved", async () => {
    const userId = "user123";

    const fakeGoal = {
      _id: "1",
      userId,
      name: "Save for Car",
      targetAmount: 10000,
      currentAmount: 5000,
      isAchieved: false,
      save: jest.fn().mockResolvedValue(true),
    };

    Goal.find.mockResolvedValueOnce([fakeGoal]);

    Transaction.aggregate.mockResolvedValueOnce([{ totalSaved: 5000 }]);

    const mockNotificationSave = jest.fn().mockResolvedValue({});
    Notification.mockImplementation(() => ({
      save: mockNotificationSave,
    }));

    await goalController.updateGoalProgress(userId);

    expect(mockNotificationSave).not.toHaveBeenCalled();
    expect(fakeGoal.save).toHaveBeenCalled();
  });

  it("should handle errors during the goal progress update", async () => {
    const userId = "user123";

    Goal.find.mockRejectedValueOnce(new Error("Error fetching goals"));

    const mockNotificationSave = jest.fn().mockResolvedValue({});
    Notification.mockImplementation(() => ({
      save: mockNotificationSave,
    }));

    await goalController.updateGoalProgress(userId);

    expect(mockNotificationSave).not.toHaveBeenCalled();
  });
});

describe("Goal Controller - Send Goal Reminder", () => {
  it("should send a goal reminder if the goal is due soon", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const fakeGoals = [
      {
        _id: "1",
        userId: "user123",
        name: "Save for Car",
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        isAchieved: false,
      },
    ];
    Goal.find.mockResolvedValueOnce(fakeGoals);

    const mockNotificationSave = jest.fn().mockResolvedValue({});
    Notification.mockImplementation(() => ({
      save: mockNotificationSave,
    }));

    await goalController.sendGoalReminder(req, res, next);

    expect(mockNotificationSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Goal reminder sent successfully.",
    });
  });

  it("should not send a reminder if the goal is not due soon", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const fakeGoals = [
      {
        _id: "1",
        userId: "user123",
        name: "Save for Car",
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        isAchieved: false,
      },
    ];
    Goal.find.mockResolvedValueOnce(fakeGoals);

    await goalController.sendGoalReminder(req, res, next);

    expect(Notification.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Goal reminder sent successfully.",
    });
  });

  it("should handle errors during goal reminder sending", async () => {
    const req = {
      user: { id: "user123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Goal.find.mockRejectedValueOnce(new Error("Error fetching goals"));

    await goalController.sendGoalReminder(req, res, next);

    expect(next).toHaveBeenCalledWith(new Error("Error fetching goals"));
  });
});
