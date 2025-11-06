import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaUsers } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
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
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Lost Something? Found Something?
            </h1>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              LostBuddy helps you reunite with your lost items through our smart matching system. 
              Join our community today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                <FaPlus className="inline w-5 h-5 mr-2" />
                Report Item
              </Link>
              <Link to="/login" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                <FaSearch className="inline w-5 h-5 mr-2" />
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How LostBuddy Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our smart platform makes it easy to report and find lost items
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Report Item</h3>
              <p className="text-gray-600">
                Report your lost or found item with details and photos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our algorithm automatically finds potential matches
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Connected</h3>
              <p className="text-gray-600">
                Connect with finders or owners to reunite items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;