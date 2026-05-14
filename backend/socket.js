const { Server } = require('socket.io');

let io;
const onlineUsers = new Map(); // Track online users

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's personal room
    socket.on('join_user_room', (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      onlineUsers.set(userId.toString(), socket.id);
      console.log(`User ${userId} joined their room and is online`);
      
      // Broadcast online status
      io.emit('user_online', { userId: userId.toString() });
    });

    // Join company's room
    socket.on('join_company_room', (companyId) => {
      if (!companyId) return;
      socket.join(`company_${companyId}`);
      console.log(`Company ${companyId} joined their room`);
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message (direct socket-to-socket fallback)
    socket.on('send_message', (data) => {
      const { conversationId, message } = data;
      console.log(`Socket message from ${socket.id} to conversation ${conversationId}`);
      io.to(`conversation_${conversationId}`).emit('new_message', message);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, userId, isTyping } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', { userId, isTyping });
    });

    // Mark message as seen
    socket.on('message_seen', (data) => {
      const { conversationId, messageId, userId } = data;
      socket.to(`conversation_${conversationId}`).emit('message_seen_status', { messageId, userId });
    });

    socket.on('disconnect', () => {
      // Find and remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} went offline`);
          io.emit('user_offline', { userId });
          break;
        }
      }
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper function to send notification to a specific user
const sendNotificationToUser = (userId, notification) => {
  const io = getIO();
  io.to(`user_${userId}`).emit('new_notification', notification);
};

// Helper function to send notification to a company
const sendNotificationToCompany = (companyId, notification) => {
  const io = getIO();
  io.to(`company_${companyId}`).emit('new_notification', notification);
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotificationToUser,
  sendNotificationToCompany,
  isUserOnline,
  getOnlineUsers
};
