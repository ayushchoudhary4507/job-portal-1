import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import LandingPage from './components/LandingPage';
import Login from './Login';
import Register from './Register';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserJobs from './pages/user/UserJobs';
import UserAppliedJobs from './pages/user/UserAppliedJobs';
import UserSavedJobs from './pages/user/UserSavedJobs';
import UserNotifications from './pages/user/UserNotifications';
import UserSettings from './pages/user/UserSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminJobs from './pages/admin/AdminJobs';
import AdminCreateJob from './pages/admin/AdminCreateJob';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApplications from './pages/admin/AdminApplications';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminRoles from './pages/admin/AdminRoles';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyJobs from './pages/company/CompanyJobs';
import CompanyCreateJob from './pages/company/CompanyCreateJob';
import CompanyApplications from './pages/company/CompanyApplications';
import CompanyCandidates from './pages/company/CompanyCandidates';
import CompanyMessages from './pages/company/CompanyMessages';
import CompanyNotifications from './pages/company/CompanyNotifications';
import CompanyAnalytics from './pages/company/CompanyAnalytics';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanySettings from './pages/company/CompanySettings';
import CompanyLayout from './components/company/CompanyLayout';

import './index.css';

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user, hasRole } = useAuth();

  if (hasRole('user')) {
    return <Navigate to="/user/dashboard" replace />;
  }
  if (hasRole('admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (hasRole('company')) {
    return <Navigate to="/company/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } 
            />
            
            {/* User Routes - Only for user role */}
            <Route 
              path="/user/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/user/profile" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/user/jobs" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserJobs />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/user/applied-jobs" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserAppliedJobs />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/user/saved-jobs" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserSavedJobs />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/user/notifications" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserNotifications />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/user/settings" 
              element={
                <RoleProtectedRoute allowedRoles={['user']}>
                  <UserSettings />
                </RoleProtectedRoute>
              } 
            />

            {/* Admin Routes - Only for admin role */}
            <Route 
              path="/admin/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminJobs />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs/create" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminCreateJob />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/applications" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminApplications />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminNotifications />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminRoles />
                  </AdminLayout>
                </RoleProtectedRoute>
              } 
            />

            {/* Company Routes - Only for company role */}
            <Route 
              path="/company/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyDashboard />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/jobs" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyJobs />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/applications" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyApplications />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/settings" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanySettings />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            
            <Route 
              path="/company/jobs/create" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyCreateJob />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/candidates" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyCandidates />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/messages" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyMessages />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/notifications" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyNotifications />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/analytics" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyAnalytics />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/company/profile" 
              element={
                <RoleProtectedRoute allowedRoles={['company']}>
                  <CompanyLayout>
                    <CompanyProfile />
                  </CompanyLayout>
                </RoleProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
