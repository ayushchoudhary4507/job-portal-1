const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Job = require('../models/Job');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Common tech skills for extraction
const COMMON_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
  'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
  'HTML', 'CSS', 'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'Jenkins',
  'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'DevOps',
  'Linux', 'Windows', 'MacOS', 'Bash', 'Shell', 'PowerShell',
  'jQuery', 'Bootstrap', 'Tailwind', 'SASS', 'Webpack', 'Vite',
  'Firebase', 'Supabase', 'GraphQL', 'Apollo', 'Redux', 'MobX',
  'Testing', 'Jest', 'Mocha', 'Selenium', 'Cypress', 'Junit',
  'Security', 'Authentication', 'OAuth', 'JWT', 'HTTPS', 'SSL'
];

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from DOCX');
  }
}

// Extract skills from text
function extractSkills(text) {
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();
  
  COMMON_SKILLS.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills);
}

// Extract education from text
function extractEducation(text) {
  const education = [];
  const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Doctorate', 'B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'BBA'];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    educationKeywords.forEach(keyword => {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        education.push({
          degree: line.trim(),
          institution: '',
          year: ''
        });
      }
    });
  });
  
  return education;
}

// Extract experience from text
function extractExperience(text) {
  const experience = [];
  const experienceKeywords = ['experience', 'worked', 'developer', 'engineer', 'manager', 'analyst', 'designer'];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    const hasKeyword = experienceKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      experience.push({
        title: line.trim(),
        company: '',
        duration: ''
      });
    }
  });
  
  return experience;
}

// Compare skills and calculate score
function compareSkills(resumeSkills, jobSkills) {
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
  
  const matched = [];
  const missing = [];
  
  jobSkillsLower.forEach(jobSkill => {
    if (resumeSkillsLower.includes(jobSkill)) {
      const originalSkill = jobSkills[jobSkillsLower.indexOf(jobSkill)];
      matched.push(originalSkill);
    } else {
      const originalSkill = jobSkills[jobSkillsLower.indexOf(jobSkill)];
      missing.push(originalSkill);
    }
  });
  
  const score = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 0;
  
  return {
    matchedSkills: matched,
    missingSkills: missing,
    scorePercentage: Math.round(score)
  };
}

// Upload and analyze resume
router.post('/analyze', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { jobId } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    // Extract text from file
    let extractedText;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
    
    if (fileType === 'pdf') {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else {
      extractedText = await extractTextFromDOCX(req.file.buffer);
    }

    // Extract information from text
    const extractedSkills = extractSkills(extractedText);
    const extractedEducation = extractEducation(extractedText);
    const extractedExperience = extractExperience(extractedText);

    // Get job skills if jobId provided
    let jobSkills = [];
    let matchedSkills = [];
    let missingSkills = [];
    let scorePercentage = 0;

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job && job.skills) {
        jobSkills = job.skills;
        const comparison = compareSkills(extractedSkills, jobSkills);
        matchedSkills = comparison.matchedSkills;
        missingSkills = comparison.missingSkills;
        scorePercentage = comparison.scorePercentage;
      }
    }

    // Save analysis to database
    const analysis = new ResumeAnalysis({
      user: userId,
      fileName: req.file.originalname,
      fileType,
      extractedText,
      extractedSkills,
      extractedEducation,
      extractedExperience,
      jobReference: jobId || null,
      jobSkills,
      matchedSkills,
      missingSkills,
      scorePercentage
    });

    await analysis.save();

    res.json({
      message: 'Resume analyzed successfully',
      analysis: {
        id: analysis._id,
        fileName: analysis.fileName,
        fileType: analysis.fileType,
        extractedSkills: analysis.extractedSkills,
        extractedEducation: analysis.extractedEducation,
        extractedExperience: analysis.extractedExperience,
        jobSkills: analysis.jobSkills,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        scorePercentage: analysis.scorePercentage
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Error analyzing resume', error: error.message });
  }
});

// Get user's resume analyses
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const analyses = await ResumeAnalysis.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis history', error: error.message });
  }
});

// Get single analysis
router.get('/:id', authenticate, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis', error: error.message });
  }
});

module.exports = router;
