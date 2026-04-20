const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Generic fetch wrapper with error handling
const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API Services
export const userAPI = {
  // Profile
  getProfile: () => fetchWithAuth('/auth/me'),
  updateProfile: (data) => fetchWithAuth('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  changePassword: (data) => fetchWithAuth('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Jobs
  getAllJobs: () => fetchWithAuth('/jobs'),
  getJobById: (id) => fetchWithAuth(`/jobs/${id}`),
  createJob: (data) => fetchWithAuth('/jobs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  applyForJob: (data) => fetchWithAuth('/applications', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Applications
  getMyApplications: () => fetchWithAuth('/applications/my-applications'),
  getApplicationById: (id) => fetchWithAuth(`/applications/${id}`),
  withdrawApplication: (id) => fetchWithAuth(`/applications/${id}`, {
    method: 'DELETE'
  }),

  // Saved Jobs
  getSavedJobs: () => fetchWithAuth('/saved-jobs'),
  saveJob: (jobId) => fetchWithAuth('/saved-jobs', {
    method: 'POST',
    body: JSON.stringify({ jobId })
  }),
  unsaveJob: (jobId) => fetchWithAuth(`/saved-jobs/${jobId}`, {
    method: 'DELETE'
  }),

  // Notifications
  getNotifications: () => fetchWithAuth('/notifications'),
  markNotificationAsRead: (id) => fetchWithAuth(`/notifications/${id}/read`, {
    method: 'PUT'
  }),
  markAllNotificationsAsRead: () => fetchWithAuth('/notifications/read-all', {
    method: 'PUT'
  }),
  deleteNotification: (id) => fetchWithAuth(`/notifications/${id}`, {
    method: 'DELETE'
  })
};

export default userAPI;
