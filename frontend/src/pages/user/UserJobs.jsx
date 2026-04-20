import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Search,
  Loader,
  Bookmark,
  Filter,
  Building2,
  CheckCircle
} from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { userAPI } from '../../services/userApi';

const UserJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const saved = await userAPI.getSavedJobs();
      setSavedJobIds(saved.map(job => job._id));
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobIds.includes(jobId)) {
        await userAPI.unsaveJob(jobId);
        setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      } else {
        await userAPI.saveJob(jobId);
        setSavedJobIds([...savedJobIds, jobId]);
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleApply = async (job) => {
    try {
      setApplyingJobId(job._id);
      await userAPI.applyForJob({
        jobId: job._id,
        coverLetter: '',
        resume: ''
      });
      setAppliedJobIds([...appliedJobIds, job._id]);
      alert('Applied successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert('Failed to apply: ' + err.message);
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || job.type?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
            onClick={fetchJobs}
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
            Browse Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your next career opportunity
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Count */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Showing {filteredJobs.length} jobs
        </p>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
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
                  onClick={() => handleSaveJob(job._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    savedJobIds.includes(job._id)
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${savedJobIds.includes(job._id) ? 'fill-current' : ''}`} />
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
                {job.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {job.salary ? `${job.salary.currency} ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}` : 'Not specified'}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-2" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {appliedJobIds.includes(job._id) ? (
                  <button
                    disabled
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 cursor-default"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Applied</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job)}
                    disabled={applyingJobId === job._id}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {applyingJobId === job._id ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <span>Apply Now</span>
                    )}
                  </button>
                )}
                <Link
                  to={`/user/jobs/${job._id}`}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No jobs found matching your criteria
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilter('all'); }}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserJobs;
