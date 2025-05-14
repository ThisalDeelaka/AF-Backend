
const userController = require('../../controllers/userController');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const Budget = require('../../models/Budget');
const Goal = require('../../models/Goal');

jest.mock('../../models/User');
jest.mock('../../models/Transaction');
jest.mock('../../models/Budget');
jest.mock('../../models/Goal');

describe('User Controller - Create User', () => {
  it('should create a new user and return it', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const fakeUser = {
      _id: '1',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      save: jest.fn().mockResolvedValueOnce(true),
    };

  
    User.mockImplementationOnce(() => fakeUser);

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it('should return error if user creation fails', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'User creation failed';
    const fakeUser = {
      save: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    };
    User.mockImplementationOnce(() => fakeUser);

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('User Controller - Get Users', () => {
  it('should return all users if user is an admin', async () => {
    const req = {
      user: { role: 'admin' },
    };
    const res = {
      json: jest.fn(),
    };

    const fakeUsers = [
      { _id: '1', email: 'user1@example.com', role: 'user' },
      { _id: '2', email: 'user2@example.com', role: 'user' },
    ];

    User.find.mockResolvedValueOnce(fakeUsers);

    await userController.getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it('should return error if user is not an admin', async () => {
    const req = {
      user: { role: 'user' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admins only.' });
  });

  it('should handle errors when fetching users', async () => {
    const req = {
      user: { role: 'admin' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Error fetching users';
    User.find.mockRejectedValueOnce(new Error(errorMessage));

    await userController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('User Controller - Update User', () => {
    it('should update a user and return the updated user', async () => {
      const req = {
        params: { userId: '1' }, 
        body: {
          email: 'newemail@example.com',
          password: 'newpassword123',
          role: 'admin',
        },
        user: { role: 'admin' },
      };
      const res = {
        json: jest.fn(),
      };
  
      const fakeUser = {
        _id: '1',
        email: 'newemail@example.com',
        password: 'newpassword123',
        role: 'admin',
        save: jest.fn().mockResolvedValueOnce(true),
      };
  
      User.findById.mockResolvedValueOnce(fakeUser);
  
      await userController.updateUser(req, res);
  
      expect(res.json).toHaveBeenCalledWith(fakeUser);
      expect(fakeUser.email).toBe('newemail@example.com');
    });
  
    it('should return error if user is not found', async () => {
      const req = {
        params: { userId: '1' }, 
        body: {
          email: 'newemail@example.com',
          password: 'newpassword123',
          role: 'admin',
        },
        user: { role: 'admin' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      User.findById.mockResolvedValueOnce(null);
  
      await userController.updateUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return error if user is not an admin', async () => {
      const req = {
        params: { userId: '1' },
        body: {
          email: 'newemail@example.com',
          password: 'newpassword123',
          role: 'admin',
        },
        user: { role: 'user' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await userController.updateUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admins only.' });
    });
  });
  
  describe('User Controller - Delete User', () => {
    it('should delete a user and return a success message', async () => {
      const req = {
        params: { userId: '1' },
        user: { role: 'admin' },
      };
      const res = {
        json: jest.fn(),
      };
  
      const fakeUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };
  
      User.findByIdAndDelete.mockResolvedValueOnce(fakeUser);
  
      await userController.deleteUser(req, res);
  
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });
  
    it('should return error if user is not found', async () => {
      const req = {
        params: { userId: '1' },  
        user: { role: 'admin' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      User.findByIdAndDelete.mockResolvedValueOnce(null);
  
      await userController.deleteUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return error if user is not an admin', async () => {
      const req = {
        params: { userId: '1' },
        user: { role: 'user' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await userController.deleteUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admins only.' });
    });
  });
  

describe('User Controller - Get User Dashboard', () => {
  it('should return the user dashboard with transactions, budgets, and goals', async () => {
    const req = {
      user: { id: 'user123' },
    };
    const res = {
      json: jest.fn(),
    };

    const fakeTransactions = [
      { _id: '1', userId: 'user123', amount: 1000, category: 'Food' },
    ];

    const fakeBudgets = [
      { _id: '1', userId: 'user123', category: 'Food', amount: 1000 },
    ];

    const fakeGoals = [
      { _id: '1', userId: 'user123', name: 'Save for Car', targetAmount: 10000 },
    ];

    Transaction.find.mockResolvedValueOnce(fakeTransactions);
    Budget.find.mockResolvedValueOnce(fakeBudgets);
    Goal.find.mockResolvedValueOnce(fakeGoals);

    await userController.getUserDashboard(req, res);

    expect(res.json).toHaveBeenCalledWith({
      transactions: fakeTransactions,
      budgets: fakeBudgets,
      goals: fakeGoals,
    });
  });

  it('should handle errors when fetching dashboard data', async () => {
    const req = {
      user: { id: 'user123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Error fetching dashboard data';
    Transaction.find.mockRejectedValueOnce(new Error(errorMessage));

    await userController.getUserDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
