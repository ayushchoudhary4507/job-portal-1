const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const jobController = require('../controllers/jobController');
const Job = require('../models/Job');

// Public routes (for employees to browse)
router.get('/', jobController.getAllJobs);
router.get('/count', jobController.getJobCount);
router.get('/:id', jobController.getJobById);

// Stats route for admin analytics
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const total = await Job.countDocuments();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await Job.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
    res.json({ total, newThisMonth });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job stats', error: error.message });
  }
});

// Protected routes (for employers and admins)
router.post('/', authenticate, authorize('employer', 'admin'), jobController.createJob);
router.put('/:id', authenticate, authorize('employer', 'admin'), jobController.updateJob);
router.delete('/:id', authenticate, authorize('employer', 'admin'), jobController.deleteJob);
router.get('/my/jobs', authenticate, authorize('employer', 'admin'), jobController.getMyJobs);

module.exports = router;
