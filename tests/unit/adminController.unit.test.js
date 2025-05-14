const adminController = require('../../controllers/adminController');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');


jest.mock('../../models/User');
jest.mock('../../models/Transaction');

describe('Admin Controller - Get Admin Dashboard', () => {
  it('should return system stats for admin', async () => {
    const req = {
      user: { role: 'admin' }, 
    };
    const res = {
      json: jest.fn(),
    };

    
    User.countDocuments.mockResolvedValue(10);

    
    Transaction.aggregate.mockResolvedValue([{ totalSpent: 5000 }]);

    await adminController.getAdminDashboard(req, res);

    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 10,
      totalSpent: 5000,
    });
  });

  it('should return 403 if user is not an admin', async () => {
    const req = {
      user: { role: 'user' }, 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await adminController.getAdminDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admins only.' });
  });

  it('should handle errors in the aggregate function', async () => {
    const req = {
      user: { role: 'admin' }, 
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

  
    User.countDocuments.mockResolvedValue(10);

  
    Transaction.aggregate.mockRejectedValue(new Error('Database error'));

    await adminController.getAdminDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
  });

  it('should handle cases where no transactions exist', async () => {
    const req = {
      user: { role: 'admin' }, 
    };
    const res = {
      json: jest.fn(),
    };

  
    User.countDocuments.mockResolvedValue(10);

    
    Transaction.aggregate.mockResolvedValue([{}]);

    await adminController.getAdminDashboard(req, res);

    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 10,
      totalSpent: 0, 
    });
  });
});
