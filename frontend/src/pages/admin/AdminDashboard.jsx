import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, Building2, TrendingUp, ArrowRight, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCompanies: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all stats in parallel
      const [usersRes, jobsRes, appsRes, allAppsRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/users/count', { headers }),
        fetch('http://localhost:5000/api/jobs/count', { headers }),
        fetch('http://localhost:5000/api/applications/count', { headers }),
        fetch('http://localhost:5000/api/applications/all', { headers })
      ]);

      const usersData = await usersRes.json();
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      const allApplications = await allAppsRes.json();

      // Calculate companies from users with 'company' role or count unique job companies
      const uniqueCompanies = new Set();
      if (Array.isArray(allApplications)) {
        allApplications.forEach(app => {
          if (app.job?.company) uniqueCompanies.add(app.job.company);
        });
      }

      setStats({
        totalUsers: usersData.count || 0,
        totalJobs: jobsData.count || 0,
        totalApplications: appsData.count || 0,
        totalCompanies: uniqueCompanies.size || 0
      });

      // Get recent applications for activity feed
      if (Array.isArray(allApplications) && allApplications.length > 0) {
        const recentApps = allApplications.slice(0, 5).map(app => ({
          type: 'application',
          title: `New application for ${app.job?.title || 'Unknown Job'}`,
          subtitle: `${app.applicant?.name || 'Unknown'} applied`,
          time: getTimeAgo(app.createdAt),
          icon: FileText,
          color: 'yellow'
        }));
        setRecentActivity(recentApps);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'violet', path: '/admin/users' },
    { title: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'green', path: '/admin/jobs' },
    { title: 'Applications', value: stats.totalApplications, icon: FileText, color: 'yellow', path: '/admin/applications' },
    { title: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'purple', path: '/admin/companies' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {user?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your job portal
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
          };
          return (
            <Link
              key={card.title}
              to={card.path}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
          >
            <Users className="w-6 h-6 text-violet-600" />
            <span className="font-medium text-violet-700 dark:text-violet-400">Manage Users</span>
          </Link>

          <Link
            to="/admin/jobs"
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Briefcase className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">Manage Jobs</span>
          </Link>

          <Link
            to="/admin/applications"
            className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <FileText className="w-6 h-6 text-yellow-600" />
            <span className="font-medium text-yellow-700 dark:text-yellow-400">View Applications</span>
          </Link>

          <Link
            to="/admin/chat"
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-400">Messages</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-6 h-6 text-red-600" />
            <span className="font-medium text-red-700 dark:text-red-400">Logout</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link to="/admin/applications" className="text-sm text-violet-600 hover:text-violet-700 flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              const colorClasses = {
                violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
                green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
                yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
                purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
              };
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${colorClasses[activity.color]} rounded-full flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
