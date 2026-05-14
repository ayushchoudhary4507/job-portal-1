const Notification = require('../models/Notification');
const { sendNotificationToUser, sendNotificationToCompany } = require('../socket');

// Notification types
const NOTIFICATION_TYPES = {
  PROFILE_VIEWED: 'profile_viewed',
  NEW_JOB_POSTED: 'new_job_posted',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  JOB_SAVED: 'job_saved',
  APPLICATION_RECEIVED: 'application_received'
};

// Create and send notification
const createNotification = async (data) => {
  try {
    const {
      recipient,
      recipientType, // 'user' or 'company'
      type,
      title,
      message,
      relatedId, // ID of related entity (job, application, etc.)
      sender
    } = data;

    // Create notification in database
    const notification = new Notification({
      recipient,
      recipientType,
      type,
      title,
      message,
      relatedId,
      sender,
      read: false
    });

    await notification.save();

    // Send real-time notification via Socket.IO
    const notificationData = {
      id: notification._id,
      type,
      title,
      message,
      relatedId,
      sender,
      createdAt: notification.createdAt,
      read: false
    };

    if (recipientType === 'user') {
      sendNotificationToUser(recipient, notificationData);
    } else if (recipientType === 'company') {
      sendNotificationToCompany(recipient, notificationData);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Notify user when recruiter views their profile
const notifyProfileViewed = async (userId, recruiterName, recruiterId) => {
  return createNotification({
    recipient: userId,
    recipientType: 'user',
    type: NOTIFICATION_TYPES.PROFILE_VIEWED,
    title: 'Profile Viewed',
    message: `${recruiterName} viewed your profile`,
    relatedId: recruiterId,
    sender: recruiterId
  });
};

// Notify user when a new job is posted matching their skills
const notifyNewJobPosted = async (userId, jobTitle, jobId, companyName) => {
  return createNotification({
    recipient: userId,
    recipientType: 'user',
    type: NOTIFICATION_TYPES.NEW_JOB_POSTED,
    title: 'New Job Posted',
    message: `${companyName} posted a new job: ${jobTitle}`,
    relatedId: jobId,
    sender: null
  });
};

// Notify user when application is accepted
const notifyApplicationAccepted = async (userId, jobTitle, jobId, companyName) => {
  return createNotification({
    recipient: userId,
    recipientType: 'user',
    type: NOTIFICATION_TYPES.APPLICATION_ACCEPTED,
    title: 'Application Accepted! 🎉',
    message: `${companyName} accepted your application for ${jobTitle}`,
    relatedId: jobId,
    sender: null
  });
};

// Notify user when application is rejected
const notifyApplicationRejected = async (userId, jobTitle, jobId, companyName) => {
  return createNotification({
    recipient: userId,
    recipientType: 'user',
    type: NOTIFICATION_TYPES.APPLICATION_REJECTED,
    title: 'Application Status Update',
    message: `${companyName} has moved on to other candidates for ${jobTitle}`,
    relatedId: jobId,
    sender: null
  });
};

// Notify user when interview is scheduled
const notifyInterviewScheduled = async (userId, jobTitle, jobId, interviewDate, companyName) => {
  return createNotification({
    recipient: userId,
    recipientType: 'user',
    type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
    title: 'Interview Scheduled! 📅',
    message: `${companyName} scheduled an interview for ${jobTitle} on ${interviewDate}`,
    relatedId: jobId,
    sender: null
  });
};

// Notify company when they receive a new application
const notifyApplicationReceived = async (companyId, applicantName, applicationId, jobTitle) => {
  return createNotification({
    recipient: companyId,
    recipientType: 'company',
    type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
    title: 'New Application Received',
    message: `${applicantName} applied for ${jobTitle}`,
    relatedId: applicationId,
    sender: null
  });
};

// Notify user when job is saved
const notifyJobSaved = async (userId, jobTitle, jobId) => {
  return createNotification({
    recipient: userId,
    recipientType: 'user',
    type: NOTIFICATION_TYPES.JOB_SAVED,
    title: 'Job Saved',
    message: `You saved ${jobTitle}`,
    relatedId: jobId,
    sender: null
  });
};

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  notifyProfileViewed,
  notifyNewJobPosted,
  notifyApplicationAccepted,
  notifyApplicationRejected,
  notifyInterviewScheduled,
  notifyApplicationReceived,
  notifyJobSaved
};
