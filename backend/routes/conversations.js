const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Create or get conversation
router.post('/', authenticate, async (req, res) => {
  try {
    const { participantId, type = 'user-company', metadata = {} } = req.body;
    const currentUserId = req.user.id;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] },
      participants: { $size: 2 }
    }).populate('participants', 'name email role avatar');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, participantId],
        type,
        metadata
      });
      await conversation.save();
      await conversation.populate('participants', 'name email role avatar');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
});

// Get all conversations for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { search } = req.query;

    let query = {
      participants: currentUserId,
      isBlocked: false
    };

    let conversations = await Conversation.find(query)
      .populate('participants', 'name email role avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Filter by search if provided
    if (search) {
      conversations = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(
          p => p._id.toString() !== currentUserId
        );
        return otherParticipant?.name?.toLowerCase().includes(search.toLowerCase());
      });
    }

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: currentUserId },
          readBy: { $not: { $elemMatch: { user: currentUserId } } },
          isDeleted: false,
          deletedFor: { $ne: currentUserId }
        });

        const otherParticipant = conv.participants.find(
          p => p._id.toString() !== currentUserId
        );

        return {
          ...conv.toObject(),
          unreadCount,
          otherParticipant
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

// Get single conversation
router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email role avatar')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === currentUserId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get unread count
    const unreadCount = await Message.countDocuments({
      conversation: conversationId,
      sender: { $ne: currentUserId },
      readBy: { $not: { $elemMatch: { user: currentUserId } } },
      isDeleted: false,
      deletedFor: { $ne: currentUserId }
    });

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== currentUserId
    );

    res.json({
      ...conversation.toObject(),
      unreadCount,
      otherParticipant
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error fetching conversation', error: error.message });
  }
});

// Mark conversation as read
router.put('/:conversationId/read', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === currentUserId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        readBy: { $not: { $elemMatch: { user: currentUserId } } }
      },
      {
        $push: {
          readBy: { user: currentUserId, readAt: new Date() }
        }
      }
    );

    // Update conversation unread count
    await conversation.markAsRead(currentUserId);

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Error marking conversation as read', error: error.message });
  }
});

// Block conversation
router.put('/:conversationId/block', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === currentUserId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    conversation.isBlocked = true;
    conversation.blockedBy = currentUserId;
    await conversation.save();

    res.json({ message: 'Conversation blocked' });
  } catch (error) {
    console.error('Block conversation error:', error);
    res.status(500).json({ message: 'Error blocking conversation', error: error.message });
  }
});

// Unblock conversation
router.put('/:conversationId/unblock', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === currentUserId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    conversation.isBlocked = false;
    conversation.blockedBy = null;
    await conversation.save();

    res.json({ message: 'Conversation unblocked' });
  } catch (error) {
    console.error('Unblock conversation error:', error);
    res.status(500).json({ message: 'Error unblocking conversation', error: error.message });
  }
});

// Delete conversation
router.delete('/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.toString() === currentUserId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mark all messages as deleted for this user
    await Message.updateMany(
      { conversation: conversationId },
      { $addToSet: { deletedFor: currentUserId } }
    );

    // Delete conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Error deleting conversation', error: error.message });
  }
});

module.exports = router;
