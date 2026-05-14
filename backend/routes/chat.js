const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// AI Career Assistant - Rule-based responses
const generateAIResponse = (userMessage, userProfile) => {
  const message = userMessage.toLowerCase();
  
  // Resume improvement suggestions
  if (message.includes('resume') || message.includes('cv')) {
    if (message.includes('improve') || message.includes('better') || message.includes('tip')) {
      return {
        type: 'resume_tips',
        response: `Here are some tips to improve your resume:

1. **Tailor your resume** to each job application by highlighting relevant skills and experience
2. **Use strong action verbs** like "achieved", "implemented", "led", "developed"
3. **Quantify your achievements** with numbers and percentages (e.g., "Increased sales by 25%")
4. **Keep it concise** - aim for 1-2 pages maximum
5. **Include relevant keywords** from the job description
6. **Proofread carefully** for typos and grammatical errors
7. **Use a clean, professional format** with consistent styling
8. **Highlight your technical skills** in a dedicated section
9. **Include a professional summary** at the top
10. **List your most recent experience first**

Would you like me to review specific sections of your resume?`
      };
    }
    return {
      type: 'resume',
      response: `I can help you with your resume! Here's what I can assist with:

- **Resume improvement tips** - Get actionable advice to enhance your CV
- **Resume formatting** - Learn best practices for layout and design
- **Skill highlighting** - Identify which skills to emphasize
- **Experience description** - Help write compelling bullet points

What specific aspect of your resume would you like help with?`
    };
  }
  
  // Interview questions
  if (message.includes('interview') || message.includes('question')) {
    if (message.includes('prepare') || message.includes('practice')) {
      return {
        type: 'interview_prep',
        response: `Here are common interview questions you should prepare for:

**Behavioral Questions:**
- "Tell me about yourself"
- "What is your greatest strength?"
- "What is your greatest weakness?"
- "Describe a challenging situation and how you handled it"
- "Why do you want to work here?"

**Technical Questions:**
- "What programming languages are you proficient in?"
- "Describe a technical project you're proud of"
- "How do you stay updated with new technologies?"
- "Explain a complex technical concept to a non-technical person"

**Situational Questions:**
- "How would you handle a tight deadline?"
- "Describe how you work in a team"
- "How do you handle constructive criticism?"

**Tips for Success:**
- Research the company beforehand
- Practice your answers out loud
- Prepare questions to ask the interviewer
- Dress professionally
- Arrive 10-15 minutes early

Would you like me to help you practice answers to any of these questions?`
      };
    }
    return {
      type: 'interview',
      response: `I can help you prepare for interviews! Here's what I can assist with:

- **Common interview questions** - Get a list of frequently asked questions
- **Practice answers** - Help formulate strong responses
- **Technical interview prep** - Prepare for coding/technical questions
- **Behavioral questions** - Master STAR method answers
- **Company-specific research** - Tips on researching potential employers

What type of interview preparation do you need help with?`
    };
  }
  
  // Skill recommendations
  if (message.includes('skill') || message.includes('learn') || message.includes('improve')) {
    return {
      type: 'skills',
      response: `Based on current job market trends, here are skills I recommend learning:

**High-Demand Technical Skills:**
- **Cloud Computing** (AWS, Azure, GCP)
- **DevOps** (Docker, Kubernetes, CI/CD)
- **Machine Learning/AI** (Python, TensorFlow, PyTorch)
- **Data Science** (Pandas, NumPy, SQL)
- **Cybersecurity** (Network security, ethical hacking)
- **Full-Stack Development** (React, Node.js, databases)

**Soft Skills:**
- Communication and presentation
- Problem-solving and critical thinking
- Leadership and teamwork
- Adaptability and continuous learning
- Time management and organization

**Industry-Specific Skills:**
- **Finance**: Financial modeling, risk analysis
- **Marketing**: Digital marketing, SEO, analytics
- **Healthcare**: Medical terminology, patient care
- **Education**: Curriculum development, e-learning

**Learning Resources:**
- Online platforms (Coursera, Udemy, edX)
- Free resources (YouTube, documentation)
- Certifications (AWS, Google, Microsoft)
- Practice projects and open-source contributions

What field or role are you targeting? I can provide more specific recommendations!`
    };
  }
  
  // Career advice
  if (message.includes('career') || message.includes('job') || message.includes('advice')) {
    return {
      type: 'career',
      response: `I'm here to help with your career journey! Here's how I can assist:

**Career Planning:**
- Identify your strengths and interests
- Explore different career paths
- Set achievable career goals
- Create a development plan

**Job Search:**
- Optimize your job search strategy
- Network effectively
- Prepare for interviews
- Negotiate job offers

**Professional Development:**
- Identify skill gaps
- Find learning resources
- Build your portfolio
- Get certified

**Workplace Success:**
- Improve communication skills
- Build professional relationships
- Handle workplace challenges
- Advance in your current role

What specific career challenge are you facing? I'm here to help!`
    };
  }
  
  // Salary negotiation
  if (message.includes('salary') || message.includes('negotiate') || message.includes('pay')) {
    return {
      type: 'salary',
      response: `Here are tips for salary negotiation:

**Before the Negotiation:**
- Research market rates for your role and location
- Know your worth based on experience and skills
- Consider the full compensation package (benefits, bonuses, stock)
- Practice your negotiation talking points

**During the Negotiation:**
- Be confident but professional
- Focus on value you bring to the company
- Use specific examples of your achievements
- Don't reveal your current salary if asked
- Be willing to walk away if the offer is too low

**Negotiation Phrases:**
- "Based on my research and experience, I was expecting..."
- "I'm excited about this opportunity, but I was hoping for..."
- "Can we discuss the base salary?"
- "Is there flexibility in this offer?"

**What to Negotiate Besides Salary:**
- Signing bonus
- Performance bonuses
- Stock options/equity
- Remote work options
- Additional vacation time
- Professional development budget

Remember: Everything is negotiable! What's your current situation?`
    };
  }
  
  // Default response
  return {
    type: 'general',
    response: `I'm your AI Career Assistant! I can help you with:

📄 **Resume Help** - Improve your CV, formatting, and content
💼 **Interview Prep** - Practice questions and answers
🎯 **Career Advice** - Plan your career path and goals
📚 **Skill Recommendations** - Learn in-demand skills
💰 **Salary Negotiation** - Get tips on negotiating offers
🚀 **Job Search** - Optimize your job search strategy

Try asking me things like:
- "How can I improve my resume?"
- "What interview questions should I prepare for?"
- "What skills should I learn for a software developer role?"
- "How do I negotiate my salary?"

What would you like help with today?`
  };
};

// Chat endpoint
router.post('/', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Get user profile for personalized responses
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    // Generate AI response
    const aiResponse = generateAIResponse(message, user);
    
    res.json({
      userMessage: message,
      aiResponse: aiResponse.response,
      responseType: aiResponse.type,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
});

// Get chat history (optional - for future enhancement)
router.get('/history', authenticate, async (req, res) => {
  try {
    // This can be implemented later to store chat history in database
    res.json({ message: 'Chat history feature coming soon!' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
});

module.exports = router;
