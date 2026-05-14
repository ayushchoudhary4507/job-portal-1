const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const dns = require('dns');
const { initializeSocket } = require('./socket');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const savedJobRoutes = require('./routes/savedJobs');
const notificationRoutes = require('./routes/notifications');
const resumeAnalysisRoutes = require('./routes/resumeAnalysis');
const recommendationRoutes = require('./routes/recommendations');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(cors({
  // origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n📋 Troubleshooting tips:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('   Go to: Atlas Dashboard > Network Access > Add IP Address');
    console.log('2. Verify your internet connection');
    console.log('3. Check if the connection string is correct');
    process.exit(1);
  }
};

connectDB();

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal Backend API', 
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      savedJobs: '/api/saved-jobs',
      notifications: '/api/notifications'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resume-analysis', resumeAnalysisRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} - Job Portal 1 ayush rrr`);
});
