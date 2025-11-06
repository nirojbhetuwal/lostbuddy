import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  FaBox, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaExclamationTriangle
} from 'react-icons/fa';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const { user } = useAuth();

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      const response = await api.get('/claims/my-claims');
      setClaims(response.data.data.claims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load your claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'approved': return <FaCheck className="w-4 h-4" />;
      case 'rejected': return <FaTimes className="w-4 h-4" />;
      default: return <FaBox className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (activeTab === 'all') return true;
    return claim.status === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your claims...</p>
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
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <FaArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">My Claims</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
            <div className="text-sm text-gray-600">Total Claims</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {claims.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {claims.filter(c => c.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {claims.filter(c => c.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              {[
                { id: 'all', name: 'All Claims', count: claims.length },
                { id: 'pending', name: 'Pending', count: claims.filter(c => c.status === 'pending').length },
                { id: 'approved', name: 'Approved', count: claims.filter(c => c.status === 'approved').length },
                { id: 'rejected', name: 'Rejected', count: claims.filter(c => c.status === 'rejected').length }
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
                  <span className="ml-2 py-0.5 px-2 text-xs bg-gray-200 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Claims List */}
        {filteredClaims.length === 0 ? (
          <div className="card text-center py-12">
            <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'No claims yet' : `No ${activeTab} claims`}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' 
                ? "You haven't submitted any claims yet."
                : `You don't have any ${activeTab} claims.`
              }
            </p>
            {activeTab === 'all' && (
              <Link to="/browse" className="btn-primary">
                Browse Found Items
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClaims.map((claim) => (
              <div key={claim._id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {claim.item?.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span className="capitalize">
                        {claim.item?.type} • {claim.item?.category}
                      </span>
                      {claim.item?.location && (
                        <span>• {claim.item.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <div className={`p-2 rounded-full ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim.status)}`}>
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                  {/* Claim Message */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Your Claim Message</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-4 border">
                      {claim.message}
                    </p>
                  </div>

                  {/* Claim Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Claim Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {claim.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved:</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(claim.approvedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {claim.approvedBy && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved By:</span>
                          <span className="text-gray-900 font-medium">
                            {claim.approvedBy.username}
                          </span>
                        </div>
                      )}
                      {claim.rejectionReason && (
                        <div>
                          <span className="text-gray-600 block mb-1">Rejection Reason:</span>
                          <p className="text-red-600 bg-red-50 rounded p-2 text-sm">
                            {claim.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information for Approved Claims */}
                {claim.status === 'approved' && claim.item?.contactInfo && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FaCheck className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-800">Contact Information</h4>
                    </div>
                    <p className="text-green-700 text-sm mb-3">
                      Your claim has been approved! Contact the item owner using the information below to arrange pickup.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {claim.item.contactInfo.email && (
                        <div className="flex items-center space-x-2 text-green-700">
                          <FaEnvelope className="w-4 h-4" />
                          <span>{claim.item.contactInfo.email}</span>
                        </div>
                      )}
                      {claim.item.contactInfo.phone && (
                        <div className="flex items-center space-x-2 text-green-700">
                          <FaPhone className="w-4 h-4" />
                          <span>{claim.item.contactInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning for Rejected Claims */}
                {claim.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-800">Claim Rejected</h4>
                    </div>
                    {claim.rejectionReason && (
                      <p className="text-yellow-700 text-sm mt-1">
                        Reason: {claim.rejectionReason}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Claim ID: {claim._id.slice(-8)}
                  </span>
                  <div className="flex space-x-3">
                    {claim.status === 'pending' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to cancel this claim?')) {
                            try {
                              await api.patch(`/claims/${claim._id}/cancel`);
                              toast.success('Claim cancelled successfully');
                              fetchMyClaims();
                            } catch (error) {
                              toast.error('Failed to cancel claim');
                            }
                          }
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Cancel Claim
                      </button>
                    )}
                    <Link
                      to={`/item/${claim.item?._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Item Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;