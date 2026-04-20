const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// Get user's saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate('job', 'title company companyLogo location type salary skills createdAt')
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved jobs', error: error.message });
  }
};

// Save a job
exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    const existing = await SavedJob.findOne({ job: jobId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    const savedJob = new SavedJob({
      job: jobId,
      user: req.user._id
    });

    await savedJob.save();
    await savedJob.populate('job', 'title company companyLogo location type salary');

    res.status(201).json({ message: 'Job saved successfully', savedJob });
  } catch (error) {
    res.status(500).json({ message: 'Error saving job', error: error.message });
  }
};

// Unsave a job
exports.unsaveJob = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      job: req.params.jobId,
      user: req.user._id
    });

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing saved job', error: error.message });
  }
};

// Check if job is saved
exports.isJobSaved = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOne({
      job: req.params.jobId,
      user: req.user._id
    });

    res.json({ isSaved: !!savedJob });
  } catch (error) {
    res.status(500).json({ message: 'Error checking saved status', error: error.message });
  }
};

// Get saved jobs count
exports.getSavedJobCount = async (req, res) => {
  try {
    const count = await SavedJob.countDocuments({ user: req.user._id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved job count', error: error.message });
  }
};
