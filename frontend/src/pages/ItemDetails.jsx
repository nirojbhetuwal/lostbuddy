import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHandPaper,
  FaBox,
  FaCheck,
  FaClock
} from 'react-icons/fa';
import ClaimItem from '../components/common/ClaimItem.jsx';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}`);
      setItem(response.data.data.item);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to load item details');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to claim this item');
      return;
    }
    
    if (item.reporter._id === user.id) {
      toast.error('You cannot claim your own item');
      return;
    }

    setShowClaimModal(true);
  };

  const handleClaimSubmitted = () => {
    toast.success('Claim submitted successfully!');
    fetchItem(); // Refresh item data
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-yellow-100 text-yellow-800';
      case 'claimed': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FaClock className="w-4 h-4" />;
      case 'matched': return <FaCheck className="w-4 h-4" />;
      case 'claimed': return <FaBox className="w-4 h-4" />;
      default: return <FaBox className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <Link to="/browse" className="btn-primary">
            Browse Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Item Details</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="card">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {item.title}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Item
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)} flex items-center space-x-1`}>
                  {getStatusIcon(item.status)}
                  <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                  {item.category}
                </span>
              </div>
            </div>

            {item.type === 'found' && item.status === 'open' && isAuthenticated && item.reporter._id !== user.id && (
              <button
                onClick={handleClaimClick}
                className="btn-primary flex items-center space-x-2"
              >
                <FaHandPaper className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            )}
          </div>

          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${item.title} - Image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>

              {/* Features */}
              {(item.features?.color || item.features?.brand || item.features?.model || item.features?.size) && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Item Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {item.features.color && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Color</p>
                        <p className="font-medium text-gray-900 capitalize">{item.features.color}</p>
                      </div>
                    )}
                    {item.features.brand && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Brand</p>
                        <p className="font-medium text-gray-900">{item.features.brand}</p>
                      </div>
                    )}
                    {item.features.model && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Model</p>
                        <p className="font-medium text-gray-900">{item.features.model}</p>
                      </div>
                    )}
                    {item.features.size && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Size</p>
                        <p className="font-medium text-gray-900 capitalize">{item.features.size}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location & Date */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{item.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Date {item.type === 'lost' ? 'Lost' : 'Found'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaBox className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium text-gray-900 capitalize">{item.category}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {item.type === 'lost' ? 'Owner' : 'Finder'}
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.reporter.username}</p>
                    <p className="text-sm text-gray-600">Member</p>
                  </div>
                </div>
                
                {item.status === 'claimed' && item.contactInfo && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      {item.contactInfo.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <FaEnvelope className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{item.contactInfo.email}</span>
                        </div>
                      )}
                      {item.contactInfo.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <FaPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{item.contactInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {isAuthenticated && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {item.type === 'found' && item.status === 'open' && item.reporter._id !== user.id && (
                      <button
                        onClick={handleClaimClick}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <FaHandPaper className="w-4 h-4" />
                        <span>Claim This Item</span>
                      </button>
                    )}
                    <Link
                      to="/browse"
                      className="w-full btn-secondary text-center block"
                    >
                      Browse More Items
                    </Link>
                    {item.reporter._id === user.id && (
                      <Link
                        to="/manage-claims"
                        className="w-full btn-secondary text-center block"
                      >
                        Manage Claims
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimItem
          item={item}
          onClose={() => setShowClaimModal(false)}
          onClaimSubmitted={handleClaimSubmitted}
        />
      )}
    </div>
  );
};

export default ItemDetails;