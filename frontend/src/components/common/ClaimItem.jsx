import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaTimes, FaInfoCircle } from 'react-icons/fa';

const ClaimItem = ({ item, onClose, onClaimSubmitted }) => {
  const [formData, setFormData] = useState({
    message: '',
    contactInfo: {
      email: '',
      phone: ''
    },
    proof: []
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        contactInfo: {
          email: formData.contactInfo.email || user.email,
          phone: formData.contactInfo.phone || user.phone
        }
      };

      await api.post(`/claims/item/${item._id}`, submitData);
      
      toast.success('Claim submitted successfully!');
      onClaimSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting claim:', error);
      const message = error.response?.data?.message || 'Failed to submit claim';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Claim This Item
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Item Details</h3>
            <p className="text-sm text-gray-600">{item.title}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">
              {item.category} • Found at {item.location}
            </p>
          </div>

          {/* Claim Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Why do you believe this is your item? *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
              placeholder="Please provide details that prove this item belongs to you. Include specific features, damages, or identifying marks that only the owner would know."
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500">
                {formData.message.length}/500 characters
              </p>
              {formData.message.length > 450 && (
                <p className="text-sm text-yellow-600 flex items-center">
                  <FaInfoCircle className="w-3 h-3 mr-1" />
                  Approaching character limit
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
            <p className="text-sm text-gray-600 mb-4">
              This information will be shared with the item owner if your claim is approved.
            </p>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 mt-1"
                  placeholder={user.email}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use your account email: {user.email}
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 mt-1"
                  placeholder={user.phone || 'Your phone number'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {user.phone ? `Current: ${user.phone}` : 'Add your phone number for faster contact'}
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
              <FaInfoCircle className="w-4 h-4 mr-2" />
              Important Notes
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Be specific about how you can identify the item</li>
              <li>• Include any unique features or damages</li>
              <li>• The item owner will review your claim</li>
              <li>• You'll be notified when the claim is reviewed</li>
              <li>• Only submit claims for items you genuinely own</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.message.trim()}
              className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FaPaperPlane className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Claim'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimItem;