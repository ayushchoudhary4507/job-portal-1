const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { getIO } = require('../socket');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Send message
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text', replyTo } = req.body;
    const senderId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Content or file is required' });
    }

    // Check if conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === senderId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if conversation is blocked
    if (conversation.isBlocked && conversation.blockedBy.toString() !== senderId) {
      return res.status(403).json({ message: 'Conversation is blocked' });
    }

    // Determine message type based on file
    let finalMessageType = messageType;
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        finalMessageType = 'image';
      } else {
        finalMessageType = 'file';
      }
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      content: content || '',
      messageType: finalMessageType,
      replyTo
    });

    if (req.file) {
      message.fileName = req.file.originalname;
      message.fileSize = req.file.size;
      message.fileType = req.file.mimetype;
      // Convert buffer to base64 for storage (not ideal for production)
      message.fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Generate thumbnail for images
      if (req.file.mimetype.startsWith('image/')) {
        message.thumbnailUrl = message.fileUrl;
      }
    }

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Increment unread count for recipient
    const recipientId = conversation.participants.find(p => p.toString() !== senderId);
    if (recipientId) {
      await conversation.incrementUnread(recipientId);
    }

    // Populate sender and replyTo info
    await message.populate([
      { path: 'sender', select: 'name email avatar role' },
      { 
        path: 'replyTo',
        populate: { path: 'sender', select: 'name email avatar role' }
      }
    ]);

    // Emit socket event
    const io = getIO();
    console.log(`Emitting new_message to conversation_${conversationId}`);
    io.to(`conversation_${conversationId}`).emit('new_message', message);

    // Send notification to recipient if they're not in the conversation room
    if (recipientId) {
      console.log(`Sending message notification to user_${recipientId}`);
      io.to(`user_${recipientId}`).emit('new_message_notification', {
        conversationId,
        message,
        senderId
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get conversation messages with pagination
router.get('/conversation/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === currentUserId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: currentUserId }
    })
      .populate([
        { path: 'sender', select: 'name email avatar role' },
        { 
          path: 'replyTo',
          populate: { path: 'sender', select: 'name email avatar role' }
        }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Reverse to get chronological order
    const reversedMessages = messages.reverse();

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: currentUserId }
    });

    res.json({
      messages: reversedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
});

// Mark message as read
router.put('/:messageId/read', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Mark as read
    await message.markAsRead(currentUserId);

    // Emit socket event
    const io = getIO();
    io.to(`conversation_${message.conversation}`).emit('message_read', {
      messageId,
      userId: currentUserId,
      readAt: new Date()
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
});

// Add reaction to message
router.post('/:messageId/reaction', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const currentUserId = req.user.id;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(currentUserId, emoji);

    // Emit socket event
    const io = getIO();
    io.to(`conversation_${message.conversation}`).emit('message_reaction', {
      messageId,
      userId: currentUserId,
      emoji
    });

    res.json({ message: 'Reaction added' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Error adding reaction', error: error.message });
  }
});

// Edit message
router.put('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can edit their message
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Only text messages can be edited
    if (message.messageType !== 'text') {
      return res.status(400).json({ message: 'Only text messages can be edited' });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit socket event
    const io = getIO();
    io.to(`conversation_${message.conversation}`).emit('message_edited', {
      messageId,
      content,
      editedAt: message.editedAt
    });

    res.json({ message });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Error editing message', error: error.message });
  }
});

// Delete message for user
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await message.deleteFor(currentUserId);

    // Emit socket event
    const io = getIO();
    io.to(`conversation_${message.conversation}`).emit('message_deleted', {
      messageId,
      userId: currentUserId
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

// Get online users
router.get('/online-users', authenticate, async (req, res) => {
  try {
    const { getOnlineUsers } = require('../socket');
    const onlineUserIds = getOnlineUsers();
    
    const users = await User.find({
      _id: { $in: onlineUserIds }
    }).select('name email role avatar');

    res.json(users);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Error fetching online users', error: error.message });
  }
});

module.exports = router;
