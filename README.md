# Personal Finance Tracker API - IT22357908 (Deelaka R K A T)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/SE1020-IT2070-OOP-DSA-25/project-ThisalDeelaka)


Finance Tracker is a robust backend API designed to help users manage their finances through features such as transaction tracking, budgeting, financial goal setting, and notifications. It also provides administrative endpoints for managing users and generating system reports. The application leverages modern technologies and best practices including role-based access control (RBAC), integration testing, and unit testing.



## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [User Endpoints](#user-endpoints)
  - [Admin Endpoints](#admin-endpoints)
  - [Budget Endpoints](#budget-endpoints)
  - [Transaction Endpoints](#transaction-endpoints)
  - [Goal Endpoints](#goal-endpoints)
  - [Notification Endpoints](#notification-endpoints)
- [Running the Application](#running-the-application)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
- [Contribution Guidelines](#contribution-guidelines)




## Features

- **User Authentication:** Secure registration and login using JSON Web Tokens.
- **Role-Based Access Control (RBAC):** Separate access levels for regular users and admins.
- **Transaction Management:** Create, retrieve, export (CSV) transactions with support for recurring entries.
- **Budgeting:** Set and monitor budgets, with notifications when overspending occurs.
- **Financial Goals:** Create goals, track progress, and send reminders as due dates approach.
- **Notifications:** Generate and manage notifications for alerts and reminders.
- **Admin Dashboard:** Administrative endpoints to retrieve overall system stats and generate detailed reports.



## Tech Stack

- **Backend Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (jsonwebtoken)
- **Scheduling:** node-cron for recurring tasks
- **Testing:** Jest, Supertest
- **Other:** Helmet, CORS, dotenv



## Project Structure

```
project-ThisalDeelaka/
├── controllers/         # API controllers for various endpoints
├── middleware/          # Authentication and RBAC middleware
├── models/              # Mongoose schemas/models
├── routes/              # API route definitions
├── tests/
│   ├── integration/     # Integration test suites
│   └── unit/            # Unit test suites for controllers and utilities
├── utils/               # Utility functions (e.g., encryption, currency conversion)
├── app.js               # Express app setup
├── server.js             # Server entry point
├── .env                 # Environment variables file 
├── package.json
└── README.md
```



## Installation and Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/SE1020-IT2070-OOP-DSA-25/project-ThisalDeelaka.git
   cd project-ThisalDeelaka
   ```

2. **Install Dependencies**

   Ensure you have Node.js (v14 or later) and npm installed. Then run:

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the project root and add the required environment variables (see next section).



## Environment Variables

The application requires the following environment variables:

```ini
# .env file

# MongoDB connection string (use a test database URI for testing)
MONGO_URI=mongodb://localhost:27017/thisaldeelaka

# Secret key for JWT token generation
JWT_SECRET=your_jwt_secret_key_here

# PORT for running the server
PORT=5000

JWT_EXPIRATIONT=your_jwt_expiration_here

# Secret key for JWT token generation
ENCRYPTION_KEY=your_encryption_key_here
```





## API Documentation

### Authentication

- **Register User**

  - **Endpoint:** `POST /api/register`
  - **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourPassword",
      "role": "user" // or "admin"
    }
    ```
  - **Response:**
    ```json
    { "token": "JWT_TOKEN_HERE" }
    ```

- **Login User**

  - **Endpoint:** `POST /api/login`
  - **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourPassword"
    }
    ```
  - **Response:**
    ```json
    { "token": "JWT_TOKEN_HERE" }
    ```

### User Endpoints

- **Get User Dashboard**

  - **Endpoint:** `GET /api/user/dashboard`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:**
    ```json
    {
      "transactions": [...],
      "budgets": [...],
      "goals": [...]
    }
    ```

### Admin Endpoints

- **Admin Dashboard**

  - **Endpoint:** `GET /api/admin/dashboard`
  - **Headers:** `Authorization: <JWT_TOKEN>` (Admin token required)
  - **Response:**
    ```json
    {
      "totalUsers": 10,
      "totalSpent": 5000
    }
    ```

- **Manage Users** (Admin only)

  - **Create User:** `POST /api/users`
  - **Get Users:** `GET /api/users`
  - **Update User:** `PUT /api/users/:userId`
  - **Delete User:** `DELETE /api/users/:userId`

### Budget Endpoints

- **Create Budget**

  - **Endpoint:** `POST /api/budgets`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Body:**
    ```json
    {
      "category": "Food",
      "amount": 100
    }
    ```
  - **Response:** Created budget object

- **Get Budgets**

  - **Endpoint:** `GET /api/budgets`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:** Array of budgets

- **Check Budget Exceeding**

  - **Endpoint:** `POST /api/budgets/check`
  - **Headers:** `Authorization: <JWT_TOKEN>`

### Transaction Endpoints

- **Create Transaction**

  - **Endpoint:** `POST /api/transactions`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Body:**
    ```json
    {
      "amount": 50,
      "category": "Salary",
      "tags": ["income"],
      "type": "income",
      "originalCurrency": "USD",
      "exchangeRate": 1,
      "recurrence": "monthly"
    }
    ```
  - **Response:** Created transaction object

- **Get Transactions**

  - **Endpoint:** `GET /api/transactions`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:** Array of transactions

- **Export Transactions (CSV)**

  - **Endpoint:** `GET /api/transactions/export`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:** CSV file download

- **Process Recurring Transaction**

  - **Endpoint:** `POST /api/transactions/recurring`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Body:** Transaction data for recurring processing

- **Generate Detailed Report**

  - **Endpoint:** `GET /api/transactions/reports/detailed`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Query Parameters:** `startDate`, `endDate`, `category`
  - **Response:** Report summary grouped by category

### Goal Endpoints

- **Create Goal**

  - **Endpoint:** `POST /api/goals`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Body:**
    ```json
    {
      "name": "Save for vacation",
      "targetAmount": 2000,
      "dueDate": "2025-12-31T00:00:00.000Z"
    }
    ```
  - **Response:** Created goal object

- **Get Goals**

  - **Endpoint:** `GET /api/goals`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:** Array of goals

- **Update Goal Progress**

  - **Endpoint:** `POST /api/goals/update-progress`
  - **Headers:** `Authorization: <JWT_TOKEN>`

- **Send Goal Reminder**

  - **Endpoint:** `POST /api/goals/send-reminder`
  - **Headers:** `Authorization: <JWT_TOKEN>`

### Notification Endpoints

- **Create Notification**

  - **Endpoint:** `POST /api/notifications`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Body:**
    ```json
    {
      "message": "Test notification",
      "type": "alert"
    }
    ```
  - **Response:** Created notification object

- **Get Notifications**

  - **Endpoint:** `GET /api/notifications`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:** Array of notifications

- **Mark Notification as Read**

  - **Endpoint:** `PATCH /api/notifications/:notificationId/read`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:** Updated notification object

- **Delete Notification**

  - **Endpoint:** `DELETE /api/notifications/:notificationId`
  - **Headers:** `Authorization: <JWT_TOKEN>`
  - **Response:**
    ```json
    { "message": "Notification deleted" }
    ```



## Running the Application

1. **Start the Server**

   Make sure your MongoDB server is running, then start the application with:

   ```bash
   npm start
   ```

   The server will run on the port specified in your `.env` file (default is `5000`).

2. **Development Mode**

   For development, you can use nodemon for auto-reloading:

   ```bash
   npx nodemon index.js
   ```



## Testing

This project includes both unit and integration tests.

### Running Unit Tests

Unit tests are written using Jest and can be executed with:

```bash
npm test
```

Jest is configured to detect open handles and force exit after tests complete. Unit tests are located in the `/tests/unit/` directory.

### Running Integration Tests

Integration tests (using Supertest) are located in the `/tests/integration/` directory. They run automatically when you execute `npm test`. Integration tests clear the test database before running, so make sure your `.env` file points to a dedicated test MongoDB instance (or use an in-memory database such as `mongodb-memory-server` for testing).

To update the **README** for the performance testing, you should include instructions for how to run the performance tests using **Artillery**, along with some common troubleshooting tips. Here’s an updated section specifically for **Performance Testing** that you can add to your existing README:


## Performance Testing with Artillery

Performance testing is crucial to ensure that your API can handle a variety of loads effectively. Artillery is a powerful tool that helps you simulate traffic to your application and measure its performance under different conditions.

### Prerequisites

1. **Install Artillery:**

   Artillery is used to simulate virtual users and generate load for testing. To install it globally, run the following command:

   ```bash
   npm install -g artillery
   ```

2. **Ensure the Backend API is Running:**

   Make sure that your Express server is running before you start the performance test. The target URL in the `test.yml` configuration file is set to `http://localhost:5000`, so your backend should be accessible at that address.

   Start the server with:

   ```bash
   npm start
   ```

   Or if you're using **nodemon** for development:

   ```bash
   npx nodemon index.js
   ```

### Running the Performance Test

1. **Create the `test.yml` Configuration File**  
   The `test.yml` file contains the test scenarios and configuration for Artillery. Place it in the root of your project directory, alongside your `package.json`.

   Here's an example of the structure for the `test.yml` file:

   ```yaml
   config:
     target: "http://localhost:5000"  
     phases:
       - duration: 30  # 30 seconds with a low load
         arrivalRate: 5  # 5 virtual users per second

       - duration: 30  # 30 seconds with a medium load
         arrivalRate: 20  # 20 virtual users per second

       - duration: 30  # 30 seconds with a high load
         arrivalRate: 50  # 50 virtual users per second

   scenarios:
     - flow:
         - get:
             url: "/api/transaction"  
         - get:
             url: "/api/budget" 
         - get:
             url: "/api/users"  
   ```

2. **Run the Performance Test**

   To run the performance test, use the following command:

   ```bash
   artillery run test.yml
   ```

   This will simulate virtual users interacting with your API and provide you with real-time metrics, including request rates, response times, and error rates.

3. **View the Test Results**

   Artillery will output a summary of the performance test results in the terminal. You will see metrics such as:
   - **Request rate** (requests per second)
   - **Response time** (latency of the requests)
   - **Throughput** (requests handled per second)
   - **Error rate** (failed requests)

   For more detailed reports, you can output the results in JSON format and generate an HTML report:

   ```bash
   artillery run --output report.json test.yml
   artillery report --output report.html report.json
   ```

   The HTML report will give you a more comprehensive view of the test results.

## Contribution Guidelines

Contributions are welcome! Please follow these guidelines:

1. **Fork the Repository:** Create a feature branch off the main branch.
2. **Coding Standards:** Follow the existing coding style and add comments where necessary.
3. **Testing:** Ensure that any new functionality is accompanied by relevant unit and/or integration tests.
4. **Pull Request:** Open a pull request with a clear description of the changes.

