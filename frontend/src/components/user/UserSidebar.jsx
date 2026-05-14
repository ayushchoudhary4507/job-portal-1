import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase as LogoIcon,
  MessageSquare
} from 'lucide-react';

const UserSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [counts, setCounts] = useState({
    applications: 0,
    savedJobs: 0,
    notifications: 0
  });
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Fetch dynamic counts
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch counts from API
      const [appsRes, savedRes, notifsRes] = await Promise.allSettled([
        fetch('http://localhost:5000/api/applications/my/count', { headers }),
        fetch('http://localhost:5000/api/saved-jobs/count', { headers }),
        fetch('http://localhost:5000/api/notifications/unread-count', { headers })
      ]);

      setCounts({
        applications: appsRes.status === 'fulfilled' && appsRes.value.ok ? await appsRes.value.json().then(d => d.count).catch(() => 0) : 0,
        savedJobs: savedRes.status === 'fulfilled' && savedRes.value.ok ? await savedRes.value.json().then(d => d.count).catch(() => 0) : 0,
        notifications: notifsRes.status === 'fulfilled' && notifsRes.value.ok ? await notifsRes.value.json().then(d => d.count).catch(() => 0) : 0
      });
    } catch (error) {
      console.log('Count fetch failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const menuItems = [
    { path: '/user/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/user/jobs', name: 'Browse Jobs', icon: Briefcase },
    { path: '/user/applied-jobs', name: 'My Applications', icon: FileText, badge: counts.applications },
    { path: '/user/saved-jobs', name: 'Saved Jobs', icon: Bookmark, badge: counts.savedJobs },
    { path: '/user/chat', name: 'Messages', icon: MessageSquare },
    { path: '/user/profile', name: 'Profile / Resume', icon: User },
    { path: '/user/notifications', name: 'Notifications', icon: Bell, badge: counts.notifications },
    { path: '/user/settings', name: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
          shadow-xl lg:shadow-none flex flex-col`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <Link to="/" className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <LogoIcon className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobPortal
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group relative
                      ${isCollapsed ? 'justify-center' : ''}
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                      }
                    `}
                  >
                    <div className={`flex items-center space-x-3 ${isCollapsed ? '' : ''}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                    </div>
                    
                    {/* Badge */}
                    {!isCollapsed && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                        {item.badge > 0 && ` (${item.badge})`}
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-3 rounded-xl
              text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group relative
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`} />
    </>
  );
};

export default UserSidebar;
