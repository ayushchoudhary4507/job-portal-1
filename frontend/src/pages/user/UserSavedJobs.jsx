import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  MapPin,
  DollarSign,
  Briefcase,
  Loader,
  Trash2,
  ExternalLink,
  Building2
} from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { userAPI } from '../../services/userApi';

const UserSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getSavedJobs();
      setSavedJobs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await userAPI.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job._id !== jobId));
    } catch (err) {
      console.error('Error unsaving job:', err);
      alert('Failed to remove job from saved');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await userAPI.applyForJob({ jobId });
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to apply. You may have already applied for this job.');
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
            onClick={fetchSavedJobs}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Saved Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jobs you've bookmarked for later
          </p>
        </div>

        {/* Saved Jobs Count */}
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{savedJobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white">
              <Bookmark className="w-6 h-6 fill-current" />
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {savedJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                    {job.companyLogo || <Building2 className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsave(job._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                  job.type === 'Remote'
                    ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-400/30'
                    : job.type === 'Contract'
                    ? 'bg-purple-100 dark:bg-purple-400/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-400/30'
                    : 'bg-blue-100 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-400/30'
                }`}>
                  {job.type}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {job.salary}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApply(job._id)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                >
                  Apply Now
                </button>
                <Link
                  to={`/user/jobs/${job._id}`}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {savedJobs.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No saved jobs yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Browse jobs and click the bookmark icon to save them for later
            </p>
            <Link
              to="/user/jobs"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserSavedJobs;
