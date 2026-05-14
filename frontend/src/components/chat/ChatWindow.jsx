import { useState, useEffect, useRef } from 'react';
import { Scroll } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ currentConversation, replyingTo, onCancelReply }) => {
  const { messages, typingUsers, onlineUsers, markMessageAsRead, addReaction } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id;
  const otherParticipant = currentConversation?.otherParticipant || 
    currentConversation?.participants?.find(p => (p._id || p.id) !== currentUserId);
  const isOnline = onlineUsers.includes(otherParticipant?._id || otherParticipant?.id);
  const isTyping = typingUsers.has(otherParticipant?._id || otherParticipant?.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (currentConversation && user) {
      const currentId = user._id || user.id;
      const unreadMessages = messages.filter(
        msg => {
          const senderId = msg.sender._id || msg.sender;
          return senderId !== currentId && !msg.readBy?.some(r => (r.user._id || r.user) === currentId);
        }
      );
      unreadMessages.forEach(msg => markMessageAsRead(msg._id));
    }
  }, [currentConversation, messages, user, markMessageAsRead]);

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return messageDate.toLocaleDateString();
  };

  const handleReply = (message) => {
    // This will be handled by parent component
    if (onCancelReply) {
      onCancelReply();
    }
  };

  const handleReaction = async (messageId, emoji) => {
    await addReaction(messageId, emoji);
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Scroll className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              {otherParticipant?.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                  {otherParticipant?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {otherParticipant?.name || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(currentConversation.updatedAt)}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Scroll className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === user._id}
                onReply={handleReply}
                onReaction={handleReaction}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Replying to {(replyingTo.sender._id || replyingTo.sender) === currentUserId ? 'yourself' : otherParticipant?.name}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
