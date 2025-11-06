import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaBox,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHandPaper
} from 'react-icons/fa';
import ClaimItem from '../components/common/ClaimItem.jsx';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const categories = [
    'electronics', 'documents', 'clothing', 'accessories', 
    'bags', 'books', 'keys', 'jewelry', 'pets', 'other'
  ];

  const statusOptions = ['open', 'matched', 'claimed', 'returned'];

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...filters
      });

      const response = await api.get(`/items?${params}`);
      setItems(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get('search');
    
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleClaimClick = (item) => {
    if (!isAuthenticated) {
      toast.error('Please log in to claim an item');
      return;
    }
    
    if (item.type !== 'found') {
      toast.error('You can only claim found items');
      return;
    }

    if (item.status !== 'open') {
      toast.error('This item is no longer available for claiming');
      return;
    }

    if (item.reporter._id === user.id) {
      toast.error('You cannot claim your own item');
      return;
    }

    setSelectedItem(item);
    setShowClaimModal(true);
  };

  const handleClaimSubmitted = () => {
    toast.success('Claim submitted successfully!');
    fetchItems(); // Refresh items to update status
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

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== ''
  );

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
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
          <p className="text-gray-600 mt-2">
            Search through lost and found items in your area
          </p>
        </div>

        <div className="card mb-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search by title, description, or location..."
                  className="input-field pl-10"
                  defaultValue={filters.search}
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                  </span>
                )}
              </button>
            </div>
          </form>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'page') return null;
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="ml-2 hover:text-primary-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Type
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    <option value="lost">Lost Items</option>
                    <option value="found">Found Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="input-field"
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-12">
            <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.'
                : 'No items have been reported yet.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => (
                <div key={item._id} className="card hover:shadow-md transition-shadow">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <FaBox className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="w-4 h-4 mr-1" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-600 capitalize">
                        {item.category}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          to={`/item/${item._id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                        {item.type === 'found' && item.status === 'open' && isAuthenticated && item.reporter._id !== user?.id && (
                          <button
                            onClick={() => handleClaimClick(item)}
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
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => fetchItems(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => fetchItems(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === pagination.current
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => fetchItems(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Claim Modal */}
        {showClaimModal && selectedItem && (
          <ClaimItem
            item={selectedItem}
            onClose={() => {
              setShowClaimModal(false);
              setSelectedItem(null);
            }}
            onClaimSubmitted={handleClaimSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default BrowseItems;