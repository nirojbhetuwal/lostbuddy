cat > frontend/src/components/admin/AdminStats.jsx << 'EOF'
import React from 'react';
import {
  FaUsers,
  FaBox,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaChartLine,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';

const AdminStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      icon: FaUsers,
      color: 'blue',
      description: 'Registered users'
    },
    {
      title: 'Total Items',
      value: stats?.overview?.totalItems || 0,
      icon: FaBox,
      color: 'green',
      description: 'Lost & found items'
    },
    {
      title: 'Total Claims',
      value: stats?.overview?.totalClaims || 0,
      icon: FaClipboardCheck,
      color: 'yellow',
      description: 'Submitted claims'
    },
    {
      title: 'Pending Claims',
      value: stats?.overview?.pendingClaims || 0,
      icon: FaExclamationTriangle,
      color: 'red',
      description: 'Awaiting review'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2 text-blue-600" />
            Items by Status
          </h3>
          <div className="space-y-3">
            {stats?.itemsByStatus && Object.entries(stats.itemsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{status}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
            {(!stats?.itemsByStatus || Object.keys(stats.itemsByStatus).length === 0) && (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Items by Type */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaBox className="w-5 h-5 mr-2 text-green-600" />
            Items by Type
          </h3>
          <div className="space-y-3">
            {stats?.itemsByType && Object.entries(stats.itemsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{type}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
            {(!stats?.itemsByType || Object.keys(stats.itemsByType).length === 0) && (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Claims by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaClipboardCheck className="w-5 h-5 mr-2 text-yellow-600" />
            Claims by Status
          </h3>
          <div className="space-y-3">
            {stats?.claimsByStatus && Object.entries(stats.claimsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="capitalize text-gray-700">{status}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
            {(!stats?.claimsByStatus || Object.keys(stats.claimsByStatus).length === 0) && (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity (7 Days)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity._id} className="text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{activity.count}</p>
                  <p className="text-xs text-blue-900 font-medium">{activity._id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {stats?.itemsByCategory && Object.entries(stats.itemsByCategory)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">{category}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            {(!stats?.itemsByCategory || Object.keys(stats.itemsByCategory).length === 0) && (
              <p className="text-gray-500 text-center py-4">No category data</p>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active Users</span>
              <div className="flex items-center">
                <FaUserCheck className="w-4 h-4 text-green-500 mr-1" />
                <span className="font-semibold text-green-600">Good</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Claim Resolution</span>
              <div className="flex items-center">
                <FaClipboardCheck className="w-4 h-4 text-blue-500 mr-1" />
                <span className="font-semibold text-blue-600">
                  {stats?.overview?.pendingClaims === 0 ? 'All Clear' : 'Pending'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">System Load</span>
              <div className="flex items-center">
                <FaChartLine className="w-4 h-4 text-green-500 mr-1" />
                <span className="font-semibold text-green-600">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
