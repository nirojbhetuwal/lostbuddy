import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import {
  FaUsers,
  FaBox,
  FaClipboardCheck,
  FaChartLine,
  FaExclamationTriangle,
  FaUserCheck,
  FaUserTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
      setRecentUsers(response.data.data.recentUsers || []);
      setRecentItems(response.data.data.recentItems || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.username}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'users', name: 'Users' },
                { id: 'items', name: 'Items' },
                { id: 'claims', name: 'Claims' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<FaUsers className="w-6 h-6 text-blue-600" />}
                title="Total Users"
                value={stats.overview?.totalUsers || 0}
                color="bg-blue-100"
              />
              
              <StatCard
                icon={<FaBox className="w-6 h-6 text-green-600" />}
                title="Total Items"
                value={stats.overview?.totalItems || 0}
                color="bg-green-100"
              />
              
              <StatCard
                icon={<FaClipboardCheck className="w-6 h-6 text-yellow-600" />}
                title="Total Claims"
                value={stats.overview?.totalClaims || 0}
                color="bg-yellow-100"
              />
              
              <StatCard
                icon={<FaExclamationTriangle className="w-6 h-6 text-red-600" />}
                title="Pending Claims"
                value={stats.overview?.pendingClaims || 0}
                color="bg-red-100"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
                <div className="space-y-3">
                  {recentUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No users found</p>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <FaUserCheck className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Items */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h2>
                <div className="space-y-3">
                  {recentItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items found</p>
                  ) : (
                    recentItems.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            <FaBox className={`w-5 h-5 ${
                              item.type === 'lost' ? 'text-red-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {item.type} • {item.category}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'matched' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Items by Status */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items by Status</h2>
                <div className="space-y-3">
                  {Object.entries(stats.itemsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize text-gray-700">{status}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items by Type */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items by Type</h2>
                <div className="space-y-3">
                  {Object.entries(stats.itemsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize text-gray-700">{type}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claims by Status */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Claims by Status</h2>
                <div className="space-y-3">
                  {Object.entries(stats.claimsByStatus || {}).map(([status, count]) => {
                    const getStatusIcon = (status) => {
                      switch (status) {
                        case 'pending': return <FaClock className="w-4 h-4 text-yellow-500" />;
                        case 'approved': return <FaCheckCircle className="w-4 h-4 text-green-500" />;
                        case 'rejected': return <FaTimesCircle className="w-4 h-4 text-red-500" />;
                        default: return <FaClipboardCheck className="w-4 h-4 text-gray-500" />;
                      }
                    };

                    return (
                      <div key={status} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className="capitalize text-gray-700">{status}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600 mb-4">
              User management features will be implemented here.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                User management interface coming soon. This will include user listing, 
                role management, and account moderation features.
              </p>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Management</h2>
            <p className="text-gray-600 mb-4">
              Item management features will be implemented here.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Item management interface coming soon. This will include item listing, 
                moderation, and bulk operations.
              </p>
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Management</h2>
            <p className="text-gray-600 mb-4">
              Claim management features will be implemented here.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Claim management interface coming soon. This will include claim listing, 
                approval/rejection, and dispute resolution features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;