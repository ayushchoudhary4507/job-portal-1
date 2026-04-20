import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone, FileText, CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';

const CompanyApplications = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      candidate: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 234 567 890'
      },
      job: 'Senior Software Engineer',
      appliedDate: '2024-03-15',
      status: 'Pending',
      resume: 'resume.pdf'
    },
    {
      id: 2,
      candidate: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1 234 567 891'
      },
      job: 'Product Manager',
      appliedDate: '2024-03-14',
      status: 'Reviewing',
      resume: 'resume.pdf'
    },
    {
      id: 3,
      candidate: {
        name: 'Mike Johnson',
        email: 'mike.j@email.com',
        phone: '+1 234 567 892'
      },
      job: 'Senior Software Engineer',
      appliedDate: '2024-03-13',
      status: 'Shortlisted',
      resume: 'resume.pdf'
    }
  ]);

  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Pending', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'];

  const filteredApplications = filter === 'All' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hired':
      case 'Shortlisted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Applications</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage candidate applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Job Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Applied Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{app.candidate.name}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{app.candidate.email}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{app.job}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{app.appliedDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(app.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'Hired' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FileText className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                      <select 
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        value={app.status}
                        onChange={(e) => {
                          const newApps = applications.map(a => 
                            a.id === app.id ? { ...a, status: e.target.value } : a
                          );
                          setApplications(newApps);
                        }}
                      >
                        {filters.slice(1).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try changing the filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyApplications;
