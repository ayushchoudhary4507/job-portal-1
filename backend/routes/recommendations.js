const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');

// Calculate match percentage between user and job
function calculateMatchScore(user, job) {
  let score = 0;
  let maxScore = 0;

  // Skills matching (40% weight)
  if (user.skills && user.skills.length > 0 && job.skills && job.skills.length > 0) {
    const userSkillsLower = user.skills.map(s => s.toLowerCase());
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    
    let matchedSkills = 0;
    jobSkillsLower.forEach(jobSkill => {
      if (userSkillsLower.includes(jobSkill)) {
        matchedSkills++;
      }
    });
    
    const skillScore = (matchedSkills / jobSkills.length) * 40;
    score += skillScore;
    maxScore += 40;
  }

  // Experience matching (30% weight)
  if (user.experience && user.experience.length > 0 && job.experience) {
    const totalExperience = user.experience.reduce((total, exp) => {
      if (exp.startDate && exp.endDate) {
        const years = (exp.endDate - exp.startDate) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      }
      return total;
    }, 0);

    if (job.experience.min && totalExperience >= job.experience.min) {
      score += 30;
    } else if (job.experience.min && totalExperience >= job.experience.min * 0.8) {
      score += 20;
    } else if (job.experience.min && totalExperience >= job.experience.min * 0.5) {
      score += 10;
    }
    maxScore += 30;
  }

  // Location matching (20% weight)
  if (user.location && job.location) {
    const userLocationLower = user.location.toLowerCase();
    const jobLocationLower = job.location.toLowerCase();
    
    if (userLocationLower.includes(jobLocationLower) || jobLocationLower.includes(userLocationLower)) {
      score += 20;
    } else if (job.location.toLowerCase() === 'remote') {
      score += 15;
    }
    maxScore += 20;
  }

  // Job type preference (10% weight)
  if (user.preferredJobType && job.type) {
    if (user.preferredJobType === job.type) {
      score += 10;
    }
    maxScore += 10;
  }

  // Calculate final percentage
  const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return Math.round(finalScore);
}

// Get personalized job recommendations
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active jobs
    const jobs = await Job.find({ status: 'active' })
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 });

    // Calculate match scores for each job
    const recommendations = jobs.map(job => {
      const matchScore = calculateMatchScore(user, job);
      return {
        ...job.toObject(),
        matchScore,
        matchPercentage: matchScore
      };
    });

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Filter out jobs with 0% match and return top 20
    const filteredRecommendations = recommendations
      .filter(job => job.matchScore > 0)
      .slice(0, 20);

    res.json({
      recommendations: filteredRecommendations,
      total: filteredRecommendations.length
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// Get recommendations based on specific job ID (similar jobs)
router.get('/similar/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const targetJob = await Job.findById(jobId);
    if (!targetJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Find similar jobs based on skills and location
    const similarJobs = await Job.find({
      _id: { $ne: jobId },
      status: 'active',
      $or: [
        { skills: { $in: targetJob.skills } },
        { location: targetJob.location }
      ]
    })
      .populate('postedBy', 'name company')
      .limit(10);

    // Calculate similarity scores
    const recommendations = similarJobs.map(job => {
      let score = 0;
      
      // Skill similarity
      if (job.skills && targetJob.skills) {
        const commonSkills = job.skills.filter(skill => 
          targetJob.skills.includes(skill)
        );
        score += (commonSkills.length / targetJob.skills.length) * 60;
      }
      
      // Location match
      if (job.location === targetJob.location) {
        score += 40;
      }

      return {
        ...job.toObject(),
        matchScore: Math.round(score),
        matchPercentage: Math.round(score)
      };
    });

    // Sort by similarity score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Similar jobs error:', error);
    res.status(500).json({ message: 'Error fetching similar jobs', error: error.message });
  }
});

// Save a recommended job
router.post('/save/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({ user: userId, job: jobId });
    if (existingSave) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Create saved job
    const savedJob = new SavedJob({
      user: userId,
      job: jobId
    });

    await savedJob.save();

    res.json({ message: 'Job saved successfully', savedJob });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Error saving job', error: error.message });
  }
});

// Get saved jobs
router.get('/saved', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const savedJobs = await SavedJob.find({ user: userId })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Error fetching saved jobs', error: error.message });
  }
});

// Unsave a job
router.delete('/save/:jobId', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const savedJob = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
    
    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job unsaved successfully' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ message: 'Error unsaving job', error: error.message });
  }
});

module.exports = router;
