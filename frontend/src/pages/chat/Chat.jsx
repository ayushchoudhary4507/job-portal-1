import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, User, Building2, Shield } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatInput from '../../components/chat/ChatInput';

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentConversation, 
    setCurrentConversation, 
    fetchConversations, 
    fetchMessages, 
    joinConversation, 
    leaveConversation,
    createConversation 
  } = useChat();
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation._id);
      joinConversation(currentConversation._id);
    }

    return () => {
      if (currentConversation) {
        leaveConversation(currentConversation._id);
      }
    };
  }, [currentConversation, fetchMessages, joinConversation, leaveConversation]);

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleCloseModal = () => {
    setShowNewChatModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/search?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Filter out current user
      const filtered = data.filter(u => u._id !== user._id);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleStartConversation = async (participantId) => {
    try {
      const conversation = await createConversation(participantId, 'user-company');
      setCurrentConversation(conversation);
      handleCloseModal();
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'company':
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'company':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar onNewChat={handleNewChat} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow 
            currentConversation={currentConversation} 
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
          {currentConversation && (
            <ChatInput 
              currentConversation={currentConversation} 
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Start New Conversation</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users or companies..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery.length < 2 
                      ? 'Type at least 2 characters to search' 
                      : 'No results found'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => handleStartConversation(result._id)}
                      className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                        {result.avatar ? (
                          <img
                            src={result.avatar}
                            alt={result.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                            {result.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {result.name}
                          </h3>
                          <div className={`p-1 rounded ${getRoleColor(result.role)}`}>
                            {getRoleIcon(result.role)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
