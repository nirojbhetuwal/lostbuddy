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
  FaUser,
  FaEnvelope,
  FaPhone,
  FaExclamationTriangle
} from 'react-icons/fa';

const ManageClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectingClaim, setRejectingClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/claims/my-items');
      setClaims(response.data.data.claims);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      await api.patch(`/claims/${claimId}/approve`);
      toast.success('Claim approved successfully!');
      fetchClaims(); // Refresh claims
    } catch (error) {
      console.error('Error approving claim:', error);
      const message = error.response?.data?.message || 'Failed to approve claim';
      toast.error(message);
    }
  };

  const handleRejectClaim = async (claimId, reason) => {
    try {
      await api.patch(`/claims/${claimId}/reject`, { rejectionReason: reason });
      toast.success('Claim rejected successfully!');
      setRejectingClaim(null);
      setRejectionReason('');
      fetchClaims(); // Refresh claims
    } catch (error) {
      console.error('Error rejecting claim:', error);
      const message = error.response?.data?.message || 'Failed to reject claim';
      toast.error(message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredClaims = claims.filter(claim => {
    if (activeTab === 'all') return true;
    return claim.status === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading claims...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Manage Claims</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
                ? "No one has claimed your items yet."
                : `You don't have any ${activeTab} claims.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredClaims.map((claim) => (
              <div key={claim._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {claim.item?.title}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {claim.item?.type} • {claim.item?.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Claimant Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Claimant Information</h4>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{claim.user?.username}</p>
                        <p className="text-sm text-gray-600">{claim.user?.email}</p>
                      </div>
                    </div>
                    {claim.contactInfo && (
                      <div className="space-y-1 text-sm">
                        {claim.contactInfo.phone && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <FaPhone className="w-3 h-3" />
                            <span>{claim.contactInfo.phone}</span>
                          </div>
                        )}
                        {claim.contactInfo.email && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <FaEnvelope className="w-3 h-3" />
                            <span>{claim.contactInfo.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Claim Message */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Claim Message</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                      {claim.message}
                    </p>
                  </div>
                </div>

                {/* Actions for Pending Claims */}
                {claim.status === 'pending' && (
                  <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => setRejectingClaim(claim._id)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FaTimes className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>
                    <button
                      onClick={() => handleApproveClaim(claim._id)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <FaCheck className="w-4 h-4" />
                      <span>Approve Claim</span>
                    </button>
                  </div>
                )}

                {/* Rejection Modal */}
                {rejectingClaim === claim._id && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800 mb-2">Reject Claim</h4>
                        <p className="text-yellow-700 text-sm mb-3">
                          Please provide a reason for rejecting this claim. This will be shared with the claimant.
                        </p>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-3 mt-3">
                          <button
                            onClick={() => {
                              setRejectingClaim(null);
                              setRejectionReason('');
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRejectClaim(claim._id, rejectionReason)}
                            disabled={!rejectionReason.trim()}
                            className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Claim Details */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    <div>Submitted: {new Date(claim.createdAt).toLocaleDateString()}</div>
                    {claim.approvedAt && (
                      <div>Approved: {new Date(claim.approvedAt).toLocaleDateString()}</div>
                    )}
                    {claim.rejectionReason && (
                      <div className="text-red-600">Reason: {claim.rejectionReason}</div>
                    )}
                  </div>
                  <Link
                    to={`/item/${claim.item?._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Item Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageClaims;