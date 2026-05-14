import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const commonEmojis = ['😀', '😂', '🥰', '😎', '👍', '👋', '🎉', '💼', '✅', '❤️', '🔥', '💪'];

  useEffect(() => {
    if (user && user.id) {
      // Initialize socket
      const newSocket = io('http://localhost:5000', {
        auth: { token: localStorage.getItem('token') }
      });

      setSocket(newSocket);

      // Join user room
      newSocket.emit('join_user_room', user.id);

      // Listen for online/offline status
      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      // Listen for new messages
      newSocket.on('receive_message', (message) => {
        if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });

      // Listen for typing indicator
      newSocket.on('user_typing', ({ userId, isTyping: typing }) => {
        if (selectedConversation) {
          const otherUserId = getOtherUserId(selectedConversation);
          if (userId === otherUserId) {
            setOtherUserTyping(typing);
          }
        }
      });

      // Listen for message seen status
      newSocket.on('message_seen_status', ({ messageId, userId }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, seen: true, seenAt: new Date() } : msg
          )
        );
      });

      // Fetch initial data
      fetchConversations();
      fetchOnlineUsers();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/online-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setOnlineUsers(data.map(u => u._id));
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(data);
        // Mark messages as seen
        const conversationId = generateConversationId(user.id, otherUserId);
        markMessagesAsSeen(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const generateConversationId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  const getOtherUserId = (conversation) => {
    const lastMessage = conversation.lastMessage;
    if (lastMessage.sender._id === user.id) {
      return lastMessage.recipient._id;
    }
    return lastMessage.sender._id;
  };

  const getOtherUserName = (conversation) => {
    const lastMessage = conversation.lastMessage;
    if (lastMessage.sender._id === user.id) {
      return lastMessage.recipient.name;
    }
    return lastMessage.sender.name;
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    const otherUserId = getOtherUserId(conversation);
    fetchMessages(otherUserId);

    // Join conversation room
    if (socket) {
      socket.emit('join_conversation', conversation.conversationId);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation || !socket) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    try {
      const token = localStorage.getItem('token');
      const otherUserId = getOtherUserId(selectedConversation);
      const formData = new FormData();
      formData.append('recipientId', otherUserId);
      formData.append('content', messageContent);
      formData.append('messageType', 'text');

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, data.message]);
        // Emit via socket
        socket.emit('send_message', {
          conversationId: selectedConversation.conversationId,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    setIsTyping(true);

    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversationId: selectedConversation.conversationId,
        userId: user.id,
        isTyping: true
      });
    }

    // Clear typing indicator after 3 seconds of no typing
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && selectedConversation) {
        socket.emit('typing', {
          conversationId: selectedConversation.conversationId,
          userId: user.id,
          isTyping: false
        });
      }
    }, 3000);
  };

  const handleEmojiClick = (emoji) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const markMessagesAsSeen = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/seen/${conversationId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUserId = getOtherUserId(conversation);
              const isOnline = isUserOnline(otherUserId);
              const lastMessage = conversation.lastMessage;

              return (
                <div
                  key={conversation.conversationId}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.conversationId === conversation.conversationId
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {getOtherUserName(conversation).charAt(0).toUpperCase()}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 truncate">
                          {getOtherUserName(conversation)}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage.messageType === 'file' ? '📎 File' : lastMessage.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {getOtherUserName(selectedConversation).charAt(0).toUpperCase()}
                  </div>
                  {isUserOnline(getOtherUserId(selectedConversation)) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getOtherUserName(selectedConversation)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isUserOnline(getOtherUserId(selectedConversation))
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isOwn = message.sender._id === user.id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        {message.messageType === 'file' ? (
                          <div>
                            <p className="flex items-center">
                              <Paperclip className="h-4 w-4 mr-2" />
                              {message.fileName}
                            </p>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      <div className={`flex items-center mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="mr-1">{formatTime(message.createdAt)}</span>
                        {isOwn && (
                          <span>
                            {message.seen ? (
                              <CheckCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                      <div className="grid grid-cols-6 gap-2">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-2xl hover:bg-gray-100 rounded p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Smile className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
