import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, TrendingUp, Filter, X } from 'lucide-react';

const JobRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    fetchRecommendations();
    fetchSavedJobs();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }

      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recommendations/saved', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSavedJobs(data.map(saved => saved.job._id));
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recommendations/save/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recommendations/save/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      }
    } catch (err) {
      console.error('Error unsaving job:', err);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchLabel = (score) => {
    if (score >= 70) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    if (score >= 30) return 'Moderate Match';
    return 'Low Match';
  };

  const getMatchTextColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRecommendations = recommendations.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'high') return job.matchScore >= 70;
    if (filter === 'medium') return job.matchScore >= 50 && job.matchScore < 70;
    if (filter === 'low') return job.matchScore < 50;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <TrendingUp className="h-8 w-8 mr-3 text-blue-600" />
            Job Recommendations
          </h1>
          <p className="text-gray-600">Personalized job matches based on your skills and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Filter by match:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'high' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High (70%+)
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Medium (50-70%)
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'low' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low (&lt;50%)
            </button>
          </div>
          <div className="text-gray-600">
            {filteredRecommendations.length} jobs found
          </div>
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-600">Update your profile with skills and experience to get better recommendations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Match Score Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Match Score</span>
                    <button
                      onClick={() => {
                        if (savedJobs.includes(job._id)) {
                          handleUnsaveJob(job._id);
                        } else {
                          handleSaveJob(job._id);
                        }
                      }}
                      className="text-white hover:text-blue-200 transition-colors"
                    >
                      {savedJobs.includes(job._id) ? (
                        <BookmarkCheck className="h-6 w-6" />
                      ) : (
                        <Bookmark className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getMatchColor(job.matchScore)} transition-all duration-500`}
                          style={{ width: `${job.matchScore}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-white">{job.matchScore}%</span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">{getMatchLabel(job.matchScore)}</p>
                </div>

                {/* Job Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 text-sm">{job.company}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {job.type}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    {job.salary && job.salary.min && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {job.salary.currency} {job.salary.min.toLocaleString()}
                        {job.salary.max && ` - ${job.salary.max.toLocaleString()}`}
                      </div>
                    )}
                    {job.experience && job.experience.min && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        {job.experience.min}+ years experience
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/user/jobs/${job._id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm text-center"
                    >
                      Apply Now
                    </Link>
                    <Link
                      to={`/user/jobs/${job._id}`}
                      className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
