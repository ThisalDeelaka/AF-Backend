const express = require('express');
const { createUser, getUsers, updateUser, deleteUser, getUserDashboard } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleAuthorization = require('../middleware/roleAuthorization');

const router = express.Router();


router.post('/users', authMiddleware, roleAuthorization(['admin']), createUser); 
router.get('/users', authMiddleware, roleAuthorization(['admin']), getUsers); 
router.put('/users/:userId', authMiddleware, roleAuthorization(['admin']), updateUser); 
router.delete('/users/:userId', authMiddleware, roleAuthorization(['admin']), deleteUser);
router.get('/user/dashboard', authMiddleware, getUserDashboard);


module.exports = router;
