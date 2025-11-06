import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaHandPaper,
  FaBox
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext.jsx';

const ItemCard = ({ item, onClaimClick }) => {
  const { user, isAuthenticated } = useAuth();

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-yellow-100 text-yellow-800';
      case 'claimed': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  };

  const handleClaimClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // This will be handled by parent component
      return;
    }
    
    if (onClaimClick) {
      onClaimClick(item);
    }
  };

  const canClaim = () => {
    return (
      isAuthenticated &&
      item.type === 'found' &&
      item.status === 'open' &&
      item.reporter._id !== user?.id
    );
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      {/* Item Image */}
      {item.images && item.images.length > 0 ? (
        <img
          src={item.images[0].url}
          alt={item.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <FaBox className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Item Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Header with Title and Status */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
            {item.title}
          </h3>
          <div className="flex flex-col space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
              {item.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
          {item.description}
        </p>

        {/* Location and Date */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FaMapMarkerAlt className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaCalendarAlt className="w-3 h-3 mr-1 flex-shrink-0" />
            <span>{new Date(item.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600 capitalize">
            {item.category}
          </span>
          
          <div className="flex space-x-2">
            <Link
              to={`/item/${item._id}`}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View
            </Link>
            
            {canClaim() && (
              <button
                onClick={handleClaimClick}
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
              >
                <FaHandPaper className="w-3 h-3" />
                <span>Claim</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;