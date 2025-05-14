const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');


// Create a new user (Admin only)
const createUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = new User({ email, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all users (Admin only)
const getUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a user (Admin only)
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email, password, role } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.email = email || user.email;
    user.password = password || user.password;
    user.role = role || user.role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    const budgets = await Budget.find({ userId: req.user.id });
    const goals = await Goal.find({ userId: req.user.id });

    res.json({
      transactions,
      budgets,
      goals,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = { createUser, getUsers, updateUser, deleteUser,getUserDashboard };
