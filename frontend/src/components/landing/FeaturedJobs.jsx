import { MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const jobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      logo: '💻',
      location: 'San Francisco, CA',
      salary: '$120k - $180k',
      type: 'Full-time',
      posted: '2 days ago',
      tags: ['React', 'Node.js', 'AWS'],
    },
    {
      id: 2,
      title: 'Product Marketing Manager',
      company: 'GrowthLabs',
      logo: '📈',
      location: 'New York, NY',
      salary: '$90k - $140k',
      type: 'Full-time',
      posted: '3 days ago',
      tags: ['Marketing', 'Strategy', 'B2B'],
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Designify',
      logo: '🎨',
      location: 'Remote',
      salary: '$80k - $130k',
      type: 'Remote',
      posted: '1 day ago',
      tags: ['Figma', 'UI Design', 'User Research'],
    },
    {
      id: 4,
      title: 'Financial Analyst',
      company: 'FinanceHub',
      logo: '💰',
      location: 'Chicago, IL',
      salary: '$70k - $110k',
      type: 'Full-time',
      posted: '4 days ago',
      tags: ['Finance', 'Excel', 'SQL'],
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudSystems',
      logo: '☁️',
      location: 'Austin, TX',
      salary: '$110k - $160k',
      type: 'Full-time',
      posted: '2 days ago',
      tags: ['AWS', 'Docker', 'Kubernetes'],
    },
    {
      id: 6,
      title: 'Content Writer',
      company: 'MediaPro',
      logo: '✍️',
      location: 'Remote',
      salary: '$50k - $80k',
      type: 'Contract',
      posted: '1 week ago',
      tags: ['Writing', 'SEO', 'Content'],
    },
  ];

  return (
    <section id="jobs" className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Dark mode background decoration */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              Featured Jobs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Hand-picked opportunities from top companies
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 md:mt-0 text-blue-600 dark:text-indigo-400 font-medium flex items-center space-x-2 hover:text-blue-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/80 rounded-xl flex items-center justify-center text-2xl">
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.company}</p>
                  </div>
                </div>
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
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-2" />
                  {job.posted}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-transparent dark:border-gray-600/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Apply Button */}
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-600 dark:to-purple-600 text-white py-2.5 rounded-xl font-medium hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
