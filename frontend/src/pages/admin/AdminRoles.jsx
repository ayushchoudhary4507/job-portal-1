import { useState, useEffect } from 'react';
import { Shield, Users, Plus, Edit2, Trash2, Check, X, Loader } from 'lucide-react';

const AdminRoles = () => {
  const [roles, setRoles] = useState([
    { _id: '1', name: 'Admin', permissions: ['all'], description: 'Full platform access', userCount: 2 },
    { _id: '2', name: 'Employee', permissions: ['view_jobs', 'apply_jobs', 'save_jobs'], description: 'Job seeker access', userCount: 85 },
    { _id: '3', name: 'Company', permissions: ['post_jobs', 'view_applications', 'manage_company'], description: 'Employer access', userCount: 37 },
  ]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const availablePermissions = [
    { id: 'all', label: 'All Permissions' },
    { id: 'view_jobs', label: 'View Jobs' },
    { id: 'apply_jobs', label: 'Apply for Jobs' },
    { id: 'save_jobs', label: 'Save Jobs' },
    { id: 'post_jobs', label: 'Post Jobs' },
    { id: 'edit_jobs', label: 'Edit Jobs' },
    { id: 'delete_jobs', label: 'Delete Jobs' },
    { id: 'view_applications', label: 'View Applications' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_company', label: 'Manage Company' },
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'system_settings', label: 'System Settings' }
  ];

  const handleCreateRole = () => {
    if (!newRole.name) return;
    
    const role = {
      _id: Date.now().toString(),
      ...newRole,
      userCount: 0
    };
    
    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', permissions: [] });
    setShowModal(false);
  };

  const handleUpdateRole = (roleId, updates) => {
    setRoles(roles.map(r => r._id === roleId ? { ...r, ...updates } : r));
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    setRoles(roles.filter(r => r._id !== roleId));
  };

  const togglePermission = (permission) => {
    const current = editingRole ? editingRole.permissions : newRole.permissions;
    const updated = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    
    if (editingRole) {
      setEditingRole({ ...editingRole, permissions: updated });
    } else {
      setNewRole({ ...newRole, permissions: updated });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.userCount} users</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingRole(role)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{role.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {role.permissions.slice(0, 4).map((perm) => (
                <span 
                  key={perm}
                  className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded text-xs"
                >
                  {perm.replace('_', ' ')}
                </span>
              ))}
              {role.permissions.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                  +{role.permissions.length - 4} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showModal || editingRole) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editingRole ? editingRole.name : newRole.name}
                  onChange={(e) => editingRole 
                    ? setEditingRole({ ...editingRole, name: e.target.value })
                    : setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editingRole ? editingRole.description : newRole.description}
                  onChange={(e) => editingRole 
                    ? setEditingRole({ ...editingRole, description: e.target.value })
                    : setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {availablePermissions.map((perm) => (
                    <button
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-left text-sm transition-colors ${
                        (editingRole ? editingRole.permissions : newRole.permissions).includes(perm.id)
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {(editingRole ? editingRole.permissions : newRole.permissions).includes(perm.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span>{perm.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRole(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => editingRole 
                  ? handleUpdateRole(editingRole._id, editingRole)
                  : handleCreateRole()
                }
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                {editingRole ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
