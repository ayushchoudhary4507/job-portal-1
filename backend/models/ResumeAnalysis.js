const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  extractedSkills: [{
    type: String
  }],
  extractedEducation: [{
    degree: String,
    institution: String,
    year: String
  }],
  extractedExperience: [{
    title: String,
    company: String,
    duration: String
  }],
  jobReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  jobSkills: [{
    type: String
  }],
  matchedSkills: [{
    type: String
  }],
  missingSkills: [{
    type: String
  }],
  scorePercentage: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
