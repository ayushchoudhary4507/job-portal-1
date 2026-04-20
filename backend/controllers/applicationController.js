const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resume, answers } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume,
      answers
    });

    await application.save();

    // Increment job applications count
    job.applications += 1;
    await job.save();

    // Create notification for employer
    await Notification.create({
      user: job.postedBy,
      title: 'New Job Application',
      message: `${req.user.name} has applied for ${job.title}`,
      type: 'application',
      data: { applicationId: application._id, jobId: job._id }
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
};

// Get my applications (employee)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company companyLogo location type salary')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    }).populate('job', 'title company companyLogo location type salary description');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status === 'accepted') {
      return res.status(400).json({ message: 'Cannot withdraw accepted application' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing application', error: error.message });
  }
};

// Get applications for a job (employer)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone profile')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Update application status (employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = status;
    if (notes) application.notes = notes;
    await application.save();

    // Notify applicant
    const statusMessages = {
      accepted: 'Congratulations! Your application has been accepted.',
      rejected: 'We regret to inform you that your application was not selected.',
      reviewing: 'Your application is being reviewed.'
    };

    await Notification.create({
      user: application.applicant,
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: statusMessages[status] || `Your application status changed to ${status}`,
      type: 'application',
      data: { applicationId: application._id, jobId: application.job._id }
    });

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
};

// Get total application count (admin)
exports.getApplicationCount = async (req, res) => {
  try {
    const count = await Application.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application count', error: error.message });
  }
};

// Get my application count
exports.getMyApplicationCount = async (req, res) => {
  try {
    const count = await Application.countDocuments({ applicant: req.user._id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application count', error: error.message });
  }
};
