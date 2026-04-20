import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-3xl p-8 md:p-16 overflow-hidden shadow-xl dark:shadow-[0_0_60px_rgba(99,102,241,0.3)]">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 dark:bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          <div className="absolute inset-0 dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Ready to Start Your Career?
            </h2>
            <p className="text-lg text-blue-100 dark:text-indigo-100 mb-8">
              Join thousands of job seekers who have found their dream jobs through our platform. Create your free account today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 dark:text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#jobs"
                className="text-white border-2 border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-200 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Browse Jobs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
