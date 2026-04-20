import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Bookmark,
  Bell,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  User
} from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { userAPI } from '../../services/userApi';

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalApplied: 0,
    activeApplications: 0,
    savedJobs: 0,
    notifications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [applications, savedJobs, notifications, allJobs] = await Promise.all([
        userAPI.getMyApplications(),
        userAPI.getSavedJobs(),
        userAPI.getNotifications(),
        userAPI.getAllJobs()
      ]);

      setStats({
        totalApplied: applications.length,
        activeApplications: applications.filter(app => app.status === 'pending').length,
        savedJobs: savedJobs.length,
        notifications: notifications.filter(n => !n.read).length
      });

      setRecentApplications(applications.slice(0, 5));
      // Show first 4 jobs as recommended
      setRecommendedJobs(allJobs.slice(0, 4));
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Applied', value: stats.totalApplied, icon: FileText, color: 'violet', link: '/user/applied-jobs' },
    { label: 'Active Applications', value: stats.activeApplications, icon: Clock, color: 'green', link: '/user/applied-jobs' },
    { label: 'Saved Jobs', value: stats.savedJobs, icon: Bookmark, color: 'purple', link: '/user/saved-jobs' },
    { label: 'Notifications', value: stats.notifications, icon: Bell, color: 'yellow', link: '/user/notifications' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-400/30';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-400/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-400/30';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30';
      default:
        return 'bg-gray-100 dark:bg-gray-400/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/30 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your job search activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            const colorClasses = {
              violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
              green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
              yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
            };
            return (
              <Link
                key={card.label}
                to={card.link}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/user/jobs"
              className="flex items-center space-x-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
            >
              <Briefcase className="w-6 h-6 text-violet-600" />
              <span className="font-medium text-violet-700 dark:text-violet-400">Browse Jobs</span>
            </Link>

            <Link
              to="/user/profile"
              className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <User className="w-6 h-6 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-400">Update Profile</span>
            </Link>

            <Link
              to="/user/saved-jobs"
              className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Bookmark className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-purple-700 dark:text-purple-400">Saved Jobs</span>
            </Link>

            <Link
              to="/user/notifications"
              className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <Bell className="w-6 h-6 text-yellow-600" />
              <span className="font-medium text-yellow-700 dark:text-yellow-400">Notifications</span>
            </Link>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended Jobs</h2>
            <Link to="/user/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              View All Jobs <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.length === 0 ? (
              <div className="col-span-2 p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No jobs available at the moment. Check back later!
                </p>
              </div>
            ) : (
              recommendedJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{job.companyLogo || '💼'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location}
                        </span>
                        <span className="capitalize">{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {job.salary ? `${job.salary.currency} ${job.salary.min?.toLocaleString()}` : 'Salary not disclosed'}
                    </span>
                    <Link
                      to={`/user/jobs/${job._id}`}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
            <Link to="/user/applied-jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No applications yet. Start applying for jobs!
                </p>
                <Link
                  to="/user/jobs"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              recentApplications.map((application) => (
                <div
                  key={application._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{application.job?.title || 'Job Title'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {application.job?.company || 'Company'} • Applied {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(application.status)}`}>
                      {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
