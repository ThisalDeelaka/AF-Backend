const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Controller - Register Unit Test', () => {
  it('should register a user and return a JWT token', async () => {
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
      role: 'user',
      save: jest.fn().mockResolvedValueOnce(true),
    };

    User.prototype.save.mockResolvedValueOnce(fakeUser); 
    jwt.sign.mockReturnValueOnce('fakeToken'); 

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: 'fakeToken' });
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
    User.prototype.save.mockRejectedValueOnce(new Error(errorMessage)); 

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});

describe('Auth Controller - Login Unit Test', () => {
  it('should log in a user and return a JWT token', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    };
    const res = {
      json: jest.fn(),
    };

    const fakeUser = {
      _id: '1',
      email: 'test@example.com',
      role: 'user',
      comparePassword: jest.fn().mockResolvedValueOnce(true), 
    };

    User.findOne.mockResolvedValueOnce(fakeUser); 
    jwt.sign.mockReturnValueOnce('fakeToken'); 

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({ token: 'fakeToken' });
  });

  it('should return error if credentials are invalid', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const fakeUser = {
      _id: '1',
      email: 'test@example.com',
      role: 'user',
      comparePassword: jest.fn().mockResolvedValueOnce(false), 
    };

    User.findOne.mockResolvedValueOnce(fakeUser); 

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should return error if user is not found', async () => {
    const req = {
      body: {
        email: 'nonexistent@example.com',
        password: 'password123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValueOnce(null); 

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should return error if login fails due to server error', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockRejectedValueOnce(new Error('Server Error')); 

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
  });
});
