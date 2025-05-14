const User = require('../models/User');
const Transaction = require('../models/Transaction');


const getAdminDashboard = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  try {
    const users = await User.countDocuments();
    const transactions = await Transaction.aggregate([
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
    ]);

    res.json({
      totalUsers: users,
      totalSpent: transactions[0]?.totalSpent || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminDashboard };
