import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search items...",
  className = "",
  initialValue = "",
  showClearButton = true 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Optional: Implement debounced search here for real-time search
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
          placeholder={placeholder}
        />
        
        {showClearButton && searchTerm && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleClear}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <button
          type="submit"
          className="btn-primary px-6 py-2 text-sm"
        >
          Search
        </button>
        
        {searchTerm && (
          <span className="text-sm text-gray-600">
            {searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm}
          </span>
        )}
      </div>
    </form>
  );
};

export default SearchBar;