import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatInput = ({ currentConversation, replyingTo, onCancelReply }) => {
  const { sendMessage, sendTypingIndicator } = useChat();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '💯', '✨', '🙌', '👋', '🤝'];

  useEffect(() => {
    if (currentConversation) {
      sendTypingIndicator(currentConversation._id, message.length > 0);
    }
  }, [message, currentConversation, sendTypingIndicator]);

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;
    if (!currentConversation) return;

    try {
      await sendMessage(
        currentConversation._id,
        message,
        selectedFile ? 'file' : 'text',
        selectedFile,
        replyingTo?._id
      );
      setMessage('');
      setSelectedFile(null);
      onCancelReply();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVoiceRecord = () => {
    // Voice recording implementation would go here
    setIsRecording(!isRecording);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Paperclip className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-2">
        {/* File Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.txt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji Button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-20">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Voice Recording Button */}
        <button
          onClick={handleVoiceRecord}
          className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white placeholder-gray-500"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() && !selectedFile}
          className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording...</span>
          <button onClick={handleVoiceRecord} className="underline">
            Stop
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
