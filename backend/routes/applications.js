const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');
const Application = require('../models/Application');
const {
  notifyApplicationAccepted,
  notifyApplicationRejected,
  notifyApplicationReceived
} = require('../utils/notificationHelper');

// Count routes
router.get('/count', authenticate, authorize('admin'), applicationController.getApplicationCount);
router.get('/my/count', authenticate, applicationController.getMyApplicationCount);

// Stats route for admin analytics
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await Application.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
    res.json({ total, newThisMonth });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application stats', error: error.message });
  }
});

// Admin - Get all applications
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email phone')
      .populate('job', 'title company location')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Admin - Update any application status
router.put('/:id/status', authenticate, authorize('employer', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job').populate('applicant');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Admin can update any application, employer only their own jobs
    if (req.user.role !== 'admin') {
      if (application.job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    application.status = status;
    if (notes) application.notes = notes;
    await application.save();

    // Notify applicant using Socket.IO
    if (status === 'accepted') {
      await notifyApplicationAccepted(
        application.applicant._id,
        application.job.title,
        application.job._id,
        application.job.company
      );
    } else if (status === 'rejected') {
      await notifyApplicationRejected(
        application.applicant._id,
        application.job.title,
        application.job._id,
        application.job.company
      );
    }

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
});

// User routes (applicant)
router.post('/', authenticate, authorize('user'), applicationController.applyForJob);
router.get('/my-applications', authenticate, authorize('user'), applicationController.getMyApplications);
router.get('/:id', authenticate, authorize('user'), applicationController.getApplicationById);
router.delete('/:id', authenticate, authorize('user'), applicationController.withdrawApplication);

// Employer routes
router.get('/job/:jobId', authenticate, authorize('employer', 'admin'), applicationController.getJobApplications);

module.exports = router;
