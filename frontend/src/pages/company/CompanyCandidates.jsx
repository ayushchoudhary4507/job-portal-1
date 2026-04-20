import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Phone, FileText, ExternalLink, Search, Filter } from 'lucide-react';
import CompanyLayout from '../../components/company/CompanyLayout';

const CompanyCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const res = await fetch('http://localhost:5000/api/applications/all', { headers });
      const applications = await res.json();

      // Get unique candidates
      const uniqueCandidates = [];
      const seen = new Set();

      applications.forEach(app => {
        if (app.applicant && !seen.has(app.applicant._id)) {
          seen.add(app.applicant._id);
          uniqueCandidates.push({
            ...app.applicant,
            appliedJobs: applications.filter(a => a.applicant?._id === app.applicant._id).map(a => a.job?.title)
          });
        }
      });

      setCandidates(uniqueCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Candidates</h1>
          <p className="text-gray-600 dark:text-gray-400">View all candidates who applied to your jobs</p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {candidate.appliedJobs?.length || 0} applications
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{candidate.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{candidate.email}</p>

              <div className="space-y-2 mb-4">
                {candidate.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.appliedJobs?.length > 0 && (
                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4 mr-2 mt-0.5" />
                    <span className="truncate">{candidate.appliedJobs.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/company/applications?candidate=${candidate._id}`)}
                className="w-full py-2 px-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Applications</span>
              </button>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No candidates found</p>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
};

export default CompanyCandidates;
