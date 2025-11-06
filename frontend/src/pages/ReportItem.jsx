import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const ReportItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'lost',
    location: '',
    date: new Date().toISOString().split('T')[0],
    features: {
      color: '',
      brand: '',
      model: '',
      size: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'electronics', 'documents', 'clothing', 'accessories', 
    'bags', 'books', 'keys', 'jewelry', 'pets', 'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('features.')) {
      const featureName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureName]: value
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
        features: JSON.stringify(formData.features)
      };

      const response = await api.post('/items', submitData);

      toast.success('Item reported successfully!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error reporting item:', error);
      const message = error.response?.data?.message || 'Failed to report item';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to report an item.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Report {formData.type === 'lost' ? 'Lost' : 'Found'} Item
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={formData.type === 'lost'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Lost Item</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={formData.type === 'found'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Found Item</span>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., Black iPhone 13 Pro"
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Describe the item in detail. Include any unique features, damages, or identifying marks."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Location and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., Central Park, Main Street"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field mt-1"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Item Features (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="features.color"
                    value={formData.features.color}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="e.g., Black, Red, Blue"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="features.brand"
                    value={formData.features.brand}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="e.g., Apple, Samsung, Nike"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="features.model"
                    value={formData.features.model}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="e.g., iPhone 13 Pro, Galaxy S21"
                  />
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                    Size
                  </label>
                  <input
                    type="text"
                    id="size"
                    name="features.size"
                    value={formData.features.size}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="e.g., Small, Medium, Large, 42mm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <FaSave className="w-4 h-4" />
                <span>{loading ? 'Reporting...' : 'Report Item'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportItem;