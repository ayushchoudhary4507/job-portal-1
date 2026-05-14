const Job = require('../models/Job');
const User = require('../models/User');
const { notifyNewJobPosted } = require('../utils/notificationHelper');

// Get all active jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { search, location, type, skills } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (skills) {
      query.skills = { $in: skills.split(',').map(s => s.trim()) };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email companyName');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

// Create new job (employer only)
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    // Log the incoming data for debugging
    console.log('Creating job with data:', jobData);

    const job = new Job(jobData);
    await job.save();

    // Notify users whose skills match the new job
    if (job.skills && job.skills.length > 0) {
      const users = await User.find({ 
        role: 'user',
        skills: { $in: job.skills }
      });

      for (const user of users) {
        await notifyNewJobPosted(
          user._id,
          job.title,
          job._id,
          job.company
        );
      }
    }

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error('Job creation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

// Update job (employer or admin)
exports.updateJob = async (req, res) => {
  try {
    let job;
    if (req.user.role === 'admin') {
      job = await Job.findById(req.params.id);
    } else {
      job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

// Delete job (employer or admin)
exports.deleteJob = async (req, res) => {
  try {
    let job;
    if (req.user.role === 'admin') {
      job = await Job.findById(req.params.id);
    } else {
      job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// Get employer's posted jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get job count
exports.getJobCount = async (req, res) => {
  try {
    const count = await Job.countDocuments({ status: 'active' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job count', error: error.message });
  }
};
