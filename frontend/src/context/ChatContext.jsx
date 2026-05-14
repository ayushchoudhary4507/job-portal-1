import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConversations(data);
      
      // Calculate total unread count
      const totalUnread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: userId
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('join_user_room', userId);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log('Received new_message socket event:', message);
      
      const currentConvId = currentConversation?._id?.toString();
      const messageConvId = (message.conversation?._id || message.conversation)?.toString();

      // If message is for the current open conversation, add it to messages
      if (currentConvId && messageConvId === currentConvId) {
        console.log('Updating active conversation messages list');
        setMessages(prev => {
          // Prevent duplicates
          if (prev.find(m => m._id?.toString() === message._id?.toString())) return prev;
          return [...prev, message];
        });
        
        // Mark as read if I'm not the sender
        const currentUserId = (user?._id || user?.id)?.toString();
        const senderId = (message.sender?._id || message.sender?.id || message.sender)?.toString();
        if (senderId !== currentUserId) {
          markMessageAsRead(message._id);
        }
      } else {
        console.log(`Message is for conversation ${messageConvId}, but current is ${currentConvId}`);
      }
      
      // Update conversations list regardless
      setConversations(prev => {
        const conversationExists = prev.find(c => c._id?.toString() === messageConvId);
        
        if (conversationExists) {
          const updated = prev.map(conv => {
            if (conv._id?.toString() === messageConvId) {
              const currentUserId = (user?._id || user?.id)?.toString();
              const senderId = (message.sender?._id || message.sender?.id || message.sender)?.toString();
              const isMeSender = senderId === currentUserId;
              
              return {
                ...conv,
                lastMessage: message,
                updatedAt: new Date(),
                unreadCount: isMeSender ? (conv.unreadCount || 0) : (conv.unreadCount || 0) + 1
              };
            }
            return conv;
          });
          return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          console.log('Conversation not in list, fetching all...');
          fetchConversations();
          return prev;
        }
      });
    };

    const handleMessageRead = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, readBy: [...(msg.readBy || []), { user: data.userId, readAt: data.readAt }] }
          : msg
      ));
    };

    const handleMessageReaction = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), { user: data.userId, emoji: data.emoji }] }
          : msg
      ));
    };

    const handleMessageEdited = (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: data.content, edited: true, editedAt: data.editedAt }
          : msg
      ));
    };

    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    const handleUserOnline = (data) => {
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    };

    const handleUserOffline = (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    };

    const handleNewMessageNotification = (data) => {
      // Refresh conversations to get latest unread counts and last messages
      fetchConversations();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('message_reaction', handleMessageReaction);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('new_message_notification', handleNewMessageNotification);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('message_reaction', handleMessageReaction);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('new_message_notification', handleNewMessageNotification);
    };
  }, [socket, currentConversation, user, fetchConversations, markMessageAsRead]);



  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId, content, messageType = 'text', file = null, replyTo = null) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', content);
      formData.append('messageType', messageType);
      if (replyTo) formData.append('replyTo', replyTo);
      if (file) formData.append('file', file);

      console.log(`Sending message to conversation ${conversationId}...`);
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      console.log('Message sent successfully:', data.message);

      // Optimistically update messages list if socket hasn't done it yet
      setMessages(prev => {
        if (prev.find(m => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });

      // Update conversations list for sender
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: data.message,
              updatedAt: new Date()
            };
          }
          return conv;
        });
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      return data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);



  // Add reaction
  const addReaction = useCallback(async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/${messageId}/reaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, []);

  // Edit message
  const editMessage = useCallback(async (messageId, content) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (participantId, type = 'user-company', metadata = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId, type, metadata })
      });
      
      const data = await response.json();
      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, [fetchConversations]);

  // Join conversation room
  const joinConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  }, [socket]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  }, [socket]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId, isTyping) => {
    if (socket) {
      socket.emit('typing', { conversationId, userId: user?._id, isTyping });
    }
  }, [socket, user]);

  const value = {
    socket,
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    typingUsers,
    unreadCount,
    setCurrentConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    addReaction,
    editMessage,
    deleteMessage,
    createConversation,
    joinConversation,
    leaveConversation,
    sendTypingIndicator
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
