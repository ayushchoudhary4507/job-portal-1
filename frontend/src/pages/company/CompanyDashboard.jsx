import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, FileText, TrendingUp, Plus, ArrowRight, Building2, LogOut } from 'lucide-react';
import CompanyLayout from '../../components/company/CompanyLayout';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    activeJobs: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [jobsRes, appsRes] = await Promise.all([
        fetch('http://localhost:5000/api/jobs/my/jobs', { headers }),
        fetch('http://localhost:5000/api/applications/all', { headers })
      ]);

      let jobs = [];
      let applications = [];

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        jobs = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || []);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        applications = Array.isArray(appsData) ? appsData : (appsData.applications || []);
      } else {
        console.log('Applications endpoint returned:', appsRes.status);
      }

      const activeJobs = jobs.filter(job => job.status === 'active').length;

      setStats({
        totalJobs: jobs.length,
        totalApplications: applications.length || 0,
        totalCandidates: new Set(applications.map(app => app.applicant?._id)).size || 0,
        activeJobs
      });

      setRecentApplications(applications.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </CompanyLayout>
    );
  }

  const statCards = [
    { title: 'Total Jobs Posted', value: stats.totalJobs, icon: Briefcase, color: 'emerald', path: '/company/jobs' },
    { title: 'Applications Received', value: stats.totalApplications, icon: Users, color: 'blue', path: '/company/applications' },
    { title: 'Active Listings', value: stats.activeJobs, icon: TrendingUp, color: 'green', path: '/company/jobs' },
    { title: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'blue', path: '/company/applications' }
  ];

  return (
    <CompanyLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {user?.name || 'Company'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your job postings and applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/company/jobs"
            className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Manage Jobs</span>
          </Link>

          <Link
            to="/company/applications"
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-400">View Applications</span>
          </Link>

          <Link
            to="/company/settings"
            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Building2 className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-700 dark:text-gray-400">Company Profile</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-6 h-6 text-red-600" />
            <span className="font-medium text-red-700 dark:text-red-400">Logout</span>
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
          <Link to="/company/applications" className="text-sm text-emerald-600 hover:text-emerald-700">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Applied for Senior Developer</p>
              </div>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};

export default CompanyDashboard;
