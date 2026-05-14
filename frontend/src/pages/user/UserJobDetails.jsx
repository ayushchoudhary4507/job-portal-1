import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ChevronLeft,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  Loader,
  Bookmark,
  Share2,
  AlertCircle
} from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { userAPI } from '../../services/userApi';

const UserJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJobDetails();
    checkIfSaved();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getJobById(id);
      setJob(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Job not found or failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const savedJobs = await userAPI.getSavedJobs();
      setIsSaved(savedJobs.some(j => j._id === id));
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await userAPI.unsaveJob(id);
        setIsSaved(false);
      } else {
        await userAPI.saveJob(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setIsApplying(true);
      await userAPI.applyForJob({
        jobId: id,
        coverLetter,
        resume: '' // Could be expanded to allow file upload
      });
      setApplied(true);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to apply: ' + err.message);
    } finally {
      setIsApplying(false);
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

  if (error || !job) {
    return (
      <UserLayout>
        <div className="max-w-3xl mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Job not found'}</p>
          <Link
            to="/user/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          to="/user/jobs"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    {job.companyLogo || <Building2 className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{job.company}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className={`p-2.5 rounded-xl border transition-all duration-200 ${
                      isSaved
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{job.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {job.salary ? `${job.salary.currency} ${job.salary.min?.toLocaleString()}` : 'Negotiable'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-3 text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Apply Form */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Apply for this position</h3>
              
              {applied ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-800 dark:text-green-400 font-medium">Application Sent!</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    The employer will be notified. You can track this in your applications.
                  </p>
                  <Link
                    to="/user/applied-jobs"
                    className="mt-4 block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Track Application
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Why are you a good fit for this role?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || job.status !== 'active'}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isApplying ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                  {job.status !== 'active' && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      This job is no longer active.
                    </p>
                  )}
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Applicants
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{job.applications || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Job Type
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{job.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserJobDetails;
