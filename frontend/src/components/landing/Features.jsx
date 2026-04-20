import { Zap, Shield, Bell, Lock } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Easy Apply',
      description: 'Apply to multiple jobs with just one click. Save time and increase your chances of getting hired.',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified Companies',
      description: 'All companies are thoroughly verified. We ensure you only apply to legitimate employers.',
      color: 'bg-green-100 text-green-600 dark:bg-green-400/10 dark:text-green-400',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications for new job postings and application status updates.',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Secure Platform',
      description: 'Your data is encrypted and secure. We prioritize your privacy and security.',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Dark mode background decoration */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We provide the best tools and features to help you land your dream job faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-300 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 dark:group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
