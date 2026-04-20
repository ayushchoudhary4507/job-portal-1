import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Users, Edit2, Camera, Save, X, Briefcase } from 'lucide-react';
import CompanyLayout from '../../components/company/CompanyLayout';

const CompanyProfile = () => {
  const [company, setCompany] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    description: '',
    industry: '',
    companySize: '',
    founded: '',
    logo: null
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const res = await fetch('http://localhost:5000/api/auth/me', { headers });
      const userData = await res.json();

      setCompany({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        website: userData.website || '',
        location: userData.location || '',
        description: userData.description || '',
        industry: userData.industry || '',
        companySize: userData.companySize || '',
        founded: userData.founded || '',
        logo: userData.logo || null
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(company)
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Company Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your company information</p>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              editing
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {editing ? (
              <>
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </>
            ) : (
              <>
                <Edit2 className="w-5 h-5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Logo & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    {company.logo ? (
                      <img src={company.logo} alt="Company Logo" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Building2 className="w-16 h-16 text-emerald-600" />
                    )}
                  </div>
                  {editing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={company.name}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="w-full text-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{company.name || 'Company Name'}</h2>
                )}

                {editing ? (
                  <input
                    type="text"
                    name="industry"
                    value={company.industry}
                    onChange={handleChange}
                    placeholder="Industry"
                    className="w-full text-center mt-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">{company.industry || 'Industry'}</p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5" />
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={company.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    />
                  ) : (
                    <span>{company.email || 'email@company.com'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Phone className="w-5 h-5" />
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={company.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    />
                  ) : (
                    <span>{company.phone || '+1 (555) 000-0000'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={company.location}
                      onChange={handleChange}
                      placeholder="Location"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    />
                  ) : (
                    <span>{company.location || 'Location'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Globe className="w-5 h-5" />
                  {editing ? (
                    <input
                      type="url"
                      name="website"
                      value={company.website}
                      onChange={handleChange}
                      placeholder="Website"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    />
                  ) : (
                    <span>{company.website || 'www.company.com'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Company Size</label>
                  {editing ? (
                    <select
                      name="companySize"
                      value={company.companySize}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{company.companySize || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Founded</label>
                  {editing ? (
                    <input
                      type="text"
                      name="founded"
                      value={company.founded}
                      onChange={handleChange}
                      placeholder="Year founded"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{company.founded || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Description */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About Company</h3>
              {editing ? (
                <textarea
                  name="description"
                  value={company.description}
                  onChange={handleChange}
                  placeholder="Describe your company..."
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {company.description || 'No description available. Click "Edit Profile" to add information about your company.'}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">48</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Hires</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Years Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};

export default CompanyProfile;
