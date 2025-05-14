
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
require("dotenv").config();

describe("Integration Tests", () => {
  let userToken;
  let adminToken;
  let notificationId;
  let goalId;
  let transactionId;
  let budgetId;

  
  beforeAll(async () => {
    
    await mongoose.connection.dropDatabase();
  });

 
  afterAll(async () => {
    await mongoose.connection.close();
  });

 
  describe("Authentication", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/register").send({
        email: "testuser@example.com",
        password: "password",
        role: "user",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      userToken = res.body.token;
    });

    it("should login the user", async () => {
      const res = await request(app).post("/api/login").send({
        email: "testuser@example.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      userToken = res.body.token;
    });

    it("should not allow access to protected route without token", async () => {
      const res = await request(app).get("/api/user/dashboard");
      expect(res.statusCode).toBe(401);
    });
  });

  /** User Dashboard **/
  describe("User Dashboard", () => {
    it("should access user dashboard with valid token", async () => {
      const res = await request(app)
        .get("/api/user/dashboard")
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("transactions");
      expect(res.body).toHaveProperty("budgets");
      expect(res.body).toHaveProperty("goals");
    });
  });

  /** Admin Routes **/
  describe("Admin Routes", () => {
    it("should register and login an admin user", async () => {
      const res = await request(app).post("/api/register").send({
        email: "admin@example.com",
        password: "adminpassword",
        role: "admin",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      adminToken = res.body.token;
    });

    it("should access admin dashboard with valid token", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", adminToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("totalUsers");
      expect(res.body).toHaveProperty("totalSpent");
    });
  });

  /** Budget Endpoints **/
  describe("Budget Endpoints", () => {
    it("should create a budget", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set("Authorization", userToken)
        .send({
          category: "Food",
          amount: 100,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("category", "Food");
      expect(res.body).toHaveProperty("amount", 100);
      budgetId = res.body._id;
    });

    it("should retrieve budgets for the user", async () => {
      const res = await request(app)
        .get("/api/budgets")
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  /** Transaction Endpoints **/
  describe("Transaction Endpoints", () => {
    it("should create a transaction", async () => {
      const transactionData = {
        amount: 50,
        category: "Salary",
        tags: ["income"],
        type: "income",
        originalCurrency: "USD",
        exchangeRate: 1,
        recurrence: "monthly",
      };

      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", userToken)
        .send(transactionData);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("category", "Salary");
      transactionId = res.body._id;
    });

    it("should retrieve transactions for the user", async () => {
      const res = await request(app)
        .get("/api/transactions")
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should export transactions as CSV", async () => {
      const res = await request(app)
        .get("/api/transactions/export")
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
    });
  });

  /** Notification Endpoints **/
  describe("Notification Endpoints", () => {
    it("should create a notification", async () => {
      const res = await request(app)
        .post("/api/notifications")
        .set("Authorization", userToken)
        .send({
          message: "Test notification",
          type: "alert",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("_id");
      notificationId = res.body._id;
    });

    it("should retrieve notifications for the user", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should mark a notification as read", async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("isRead", true);
    });

    it("should delete a notification", async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set("Authorization", userToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Notification deleted");
    });
  });

  /** Goal Endpoints **/
  describe("Goal Endpoints", () => {
    let goalId;

    it("should create a goal", async () => {
      const res = await request(app)
        .post("/api/goals")
        .set("Authorization", userToken)
        .send({
          name: "Save for vacation",
          targetAmount: 2000,
          dueDate: "2025-12-31T00:00:00.000Z",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "Save for vacation");
      expect(res.body).toHaveProperty("targetAmount", 2000);
      expect(res.body).toHaveProperty("dueDate", "2025-12-31T00:00:00.000Z");
      goalId = res.body._id; // Store the goal ID for further tests
    });

    it("should retrieve goals for the user", async () => {
      const res = await request(app)
        .get("/api/goals")
        .set("Authorization", userToken);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0); // Ensure there is at least one goal
    });

    it("should send a goal reminder", async () => {
      const res = await request(app)
        .post("/api/goals/send-reminder")
        .set("Authorization", userToken)
        .send({
          goalId,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Goal reminder sent successfully."
      );
    });
  });
});
