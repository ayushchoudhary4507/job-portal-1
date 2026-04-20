import { Code, Megaphone, DollarSign, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();
  const categories = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'IT Jobs',
      jobs: '2,500+ Jobs',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <Megaphone className="w-8 h-8" />,
      title: 'Marketing',
      jobs: '1,200+ Jobs',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Finance',
      jobs: '900+ Jobs',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Remote Jobs',
      jobs: '3,000+ Jobs',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <section id="companies" className="py-16 md:py-24 bg-gray-50 dark:bg-slate-800/50 transition-colors duration-300 relative overflow-hidden">
      {/* Dark mode background decoration */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            Popular Categories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore jobs by category and find your perfect match
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => navigate('/login')}
              className={`${category.bgColor} dark:bg-gray-800/60 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all duration-300 cursor-pointer group border border-transparent dark:border-gray-700/50 backdrop-blur-sm`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.3)]`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">
                {category.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{category.jobs}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
