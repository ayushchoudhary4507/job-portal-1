import CompanySidebar from './CompanySidebar';

const CompanyLayout = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex overflow-hidden">
      <CompanySidebar />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CompanyLayout;
