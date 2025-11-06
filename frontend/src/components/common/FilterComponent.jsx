import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const FilterComponent = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  availableFilters = {},
  isOpen = false,
  onToggle 
}) => {
  const categories = [
    'electronics', 'documents', 'clothing', 'accessories', 
    'bags', 'books', 'keys', 'jewelry', 'pets', 'other'
  ];

  const statusOptions = ['open', 'matched', 'claimed', 'returned'];

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="btn-secondary flex items-center space-x-2"
      >
        <FaFilter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== null).length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === 'page') return null;
            
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                {key}: {value}
                <button
                  onClick={() => onFilterChange(key, '')}
                  className="ml-2 hover:text-primary-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Item Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value)}
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

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
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

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="input-field"
          >
            <option value="">All Locations</option>
            {availableFilters.locations?.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="input-field"
            max={filters.dateTo || new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="input-field"
            min={filters.dateFrom}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="input-field"
          >
            <option value="createdAt">Date Created</option>
            <option value="date">Item Date</option>
            <option value="title">Title</option>
            <option value="location">Location</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => onFilterChange('sortOrder', e.target.value)}
            className="input-field"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results Per Page */}
      <div className="mt-4 pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Items Per Page
        </label>
        <select
          value={filters.limit || '12'}
          onChange={(e) => onFilterChange('limit', e.target.value)}
          className="input-field"
        >
          <option value="6">6 items</option>
          <option value="12">12 items</option>
          <option value="24">24 items</option>
          <option value="48">48 items</option>
        </select>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <span className="text-sm text-gray-500">
          {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onClearFilters}
            className="btn-secondary"
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>
          <button
            onClick={onToggle}
            className="btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;