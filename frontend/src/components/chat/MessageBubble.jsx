import { useState } from 'react';
import { MoreVertical, Reply, Smile, Trash2, Edit2, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const MessageBubble = ({ message, isOwn, onReply, onReaction, replyingTo, onCancelReply }) => {
  const { deleteMessage, editMessage, user } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(message._id);
      setShowMenu(false);
    }
  };

  const handleEdit = async () => {
    if (editedContent.trim()) {
      await editMessage(message._id, editedContent);
      setIsEditing(false);
      setShowMenu(false);
    }
  };

  const handleReaction = async (emoji) => {
    await onReaction(message._id, emoji);
    setShowEmojiPicker(false);
  };

  const hasReacted = (emoji) => {
    return message.reactions?.some(r => r.user === user._id && r.emoji === emoji);
  };

  const getReactionCount = (emoji) => {
    return message.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`mb-1 p-2 rounded-t-lg ${
            isOwn 
              ? 'bg-violet-100 dark:bg-violet-900/20' 
              : 'bg-gray-100 dark:bg-gray-700/50'
          }`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {((message.replyTo.sender?._id || message.replyTo.sender?.id || message.replyTo.sender) === (user?._id || user?.id)) ? 'You' : (message.replyTo.sender?.name || 'Unknown User')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {message.replyTo.content}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative p-3 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
          }`}
        >
          {/* Sender Name (for group chats) */}
          {!isOwn && (
            <p className="text-xs font-semibold mb-1 text-violet-600 dark:text-violet-400">
              {message.sender?.name || 'Unknown User'}
            </p>
          )}

          {/* Message Content */}
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded text-sm focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleEdit}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              {message.messageType === 'text' && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}

              {message.messageType === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    className="max-w-full rounded-lg mb-2"
                  />
                  {message.content && <p className="text-sm mt-2">{message.content}</p>}
                </div>
              )}

              {message.messageType === 'file' && (
                <div>
                  <a
                    href={message.fileUrl}
                    download={message.fileName}
                    className="flex items-center space-x-2 text-sm underline"
                  >
                    <span>📎</span>
                    <span>{message.fileName}</span>
                  </a>
                  {message.content && <p className="text-sm mt-2">{message.content}</p>}
                </div>
              )}

              {message.messageType === 'emoji' && (
                <span className="text-4xl">{message.content}</span>
              )}
            </>
          )}

          {/* Message Info */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-70">
              {formatTime(message.createdAt)}
              {message.edited && <span className="ml-1">(edited)</span>}
            </span>

            {/* Read Receipt */}
            {isOwn && message.readBy?.length > 0 && (
              <CheckCheck className="w-4 h-4 opacity-70" />
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {emojis.map(emoji => {
                const count = getReactionCount(emoji);
                if (count > 0) {
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className={`px-2 py-0.5 rounded-full text-xs flex items-center space-x-1 ${
                        hasReacted(emoji)
                          ? 'bg-white/30'
                          : 'bg-white/20'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </button>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute ${isOwn ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded`}
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[150px]`}>
              <button
                onClick={() => {
                  onReply(message);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
              
              {isOwn && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Smile className="w-4 h-4" />
                <span>React</span>
              </button>
            </div>
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-20`}>
            <div className="grid grid-cols-4 gap-1">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
