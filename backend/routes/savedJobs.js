const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const savedJobController = require('../controllers/savedJobController');

// Count route
router.get('/count', authenticate, savedJobController.getSavedJobCount);

// All routes are for authenticated users
router.get('/', authenticate, savedJobController.getSavedJobs);
router.post('/', authenticate, savedJobController.saveJob);
router.delete('/:jobId', authenticate, savedJobController.unsaveJob);
router.get('/check/:jobId', authenticate, savedJobController.isJobSaved);

module.exports = router;
