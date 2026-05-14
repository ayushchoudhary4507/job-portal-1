const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const { register, getAllUsers, updateProfile, getUserCount } = require('../controllers/registerController');
const { login, getMe, changePassword } = require('../controllers/loginController');
const User = require('../models/User');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.get('/users/count', authenticate, authorize('admin'), getUserCount);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Stats route for admin analytics
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const total = await User.countDocuments();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
    res.json({ total, newThisMonth });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
});

// Search users endpoint for chat
router.get('/users/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name email role avatar').limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

module.exports = router;
