import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  FaPlus, 
  FaSearch, 
  FaBox, 
  FaCheck, 
  FaClock,
  FaSignOutAlt,
  FaUser,
  FaClipboardCheck,
  FaClipboardList
} from 'react-icons/fa';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    matched: 0,
    returned: 0
  });
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const response = await api.get('/items/my-items');
      setItems(response.data.data.items);
      
      const itemStats = response.data.data.items.reduce((acc, item) => {
        acc.total++;
        if (item.status === 'open') acc.open++;
        if (item.status === 'matched') acc.matched++;
        if (item.status === 'returned') acc.returned++;
        return acc;
      }, { total: 0, open: 0, matched: 0, returned: 0 });
      
      setStats(itemStats);
    } catch (error) {
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FaClock className="w-4 h-4" />;
      case 'matched': return <FaCheck className="w-4 h-4" />;
      case 'returned': return <FaBox className="w-4 h-4" />;
      default: return <FaBox className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LB</span>
                </div>
                <span className="text-xl font-bold text-gray-900">LostBuddy</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <FaUser className="w-4 h-4" />
                <span>Welcome, {user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 btn-secondary"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your lost and found items from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaBox className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            <p className="text-gray-600">Total Items</p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaClock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.open}</h3>
            <p className="text-gray-600">Open</p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.matched}</h3>
            <p className="text-gray-600">Matched</p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaBox className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.returned}</h3>
            <p className="text-gray-600">Returned</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            to="/report-item"
            className="btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <FaPlus className="w-5 h-5" />
            <span>Report New Item</span>
          </Link>
          
          <Link
            to="/browse"
            className="btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <FaSearch className="w-5 h-5" />
            <span>Browse Items</span>
          </Link>

          <Link
            to="/my-claims"
            className="btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <FaClipboardCheck className="w-5 h-5" />
            <span>My Claims</span>
          </Link>

          <Link
            to="/manage-claims"
            className="btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <FaClipboardList className="w-5 h-5" />
            <span>Manage Claims</span>
          </Link>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Recent Items</h2>
            <Link
              to="/browse?my-items=true"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items reported yet</h3>
              <p className="text-gray-600 mb-4">
                Start by reporting your first lost or found item.
              </p>
              <Link
                to="/report-item"
                className="btn-primary"
              >
                Report Your First Item
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {item.type} • {item.category} • {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <Link
                      to={`/item/${item._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;