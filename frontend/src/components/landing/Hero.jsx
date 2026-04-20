import { useState } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-500/20 rounded-full border border-blue-200 dark:border-blue-400/30 backdrop-blur-sm">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">10,000+ Jobs Available</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              Find Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Dream Job
              </span>{' '}
              Today
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
              Search thousands of jobs from top companies. We help you find the perfect career opportunity that matches your skills and passion.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-blue-500/10 dark:shadow-[0_0_40px_rgba(79,70,229,0.15)] border border-gray-100 dark:border-gray-700/50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-indigo-400" />
                  <input
                    type="text"
                    placeholder="Job title or keywords"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-indigo-400" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Search Jobs</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">500+</span>
                <span className="dark:text-gray-300">Companies</span>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-indigo-500/30"></div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">10k+</span>
                <span className="dark:text-gray-300">Jobs Posted</span>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-indigo-500/30"></div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">50k+</span>
                <span className="dark:text-gray-300">Active Users</span>
              </div>
            </div>
          </div>

          {/* Right Illustration - Animated Job Cards */}
          <div className="hidden md:block relative">
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-blue-400/30 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-indigo-400/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Main card container */}
              <div className="relative bg-white/80 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-500/20 dark:shadow-[0_0_60px_rgba(79,70,229,0.2)] p-6 border border-white/50 dark:border-indigo-500/20">
                <div className="space-y-4">
                  {/* Job Card 1 - Google */}
                  <div className="bg-white dark:bg-gray-700/80 rounded-2xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-600/50 transform hover:scale-105 transition-all duration-300 animate-float hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">Senior Software Engineer</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Google • Mountain View, CA</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs bg-green-100 dark:bg-green-400/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium border border-green-200 dark:border-green-400/30">Full-time</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">2 days ago</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600 dark:text-emerald-400">$165k</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">/year</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Job Card 2 - Meta */}
                  <div className="bg-white dark:bg-gray-700/80 rounded-2xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-600/50 transform hover:scale-105 transition-all duration-300 ml-4 hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">Product Designer</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Meta • Remote</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs bg-purple-100 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium border border-purple-200 dark:border-purple-400/30">Remote</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">5 hours ago</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">$140k</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">/year</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Job Card 3 - Netflix */}
                  <div className="bg-white dark:bg-gray-700/80 rounded-2xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-600/50 transform hover:scale-105 transition-all duration-300 animate-float-delayed hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85-.398 4.854-.398-2.8-7.924-5.923-16.63-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">Data Scientist</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Netflix • Los Gatos, CA</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium border border-blue-200 dark:border-blue-400/30">Senior</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">1 day ago</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">$185k</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">/year</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Success Badge */}
                <div className="absolute -top-3 -right-3 bg-white dark:bg-gray-700/90 rounded-2xl shadow-xl shadow-green-500/20 dark:shadow-[0_0_30px_rgba(34,197,94,0.3)] p-4 border border-green-100 dark:border-green-400/30 animate-bounce-slow backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">Job Matched!</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">98% match</p>
                    </div>
                  </div>
                </div>

                {/* Decorative dots */}
                <div className="absolute top-1/2 -left-4 w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-1/4 -right-4 w-4 h-4 bg-indigo-400 rounded-full"></div>
                <div className="absolute top-1/4 -right-2 w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
