import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReportItem from './pages/ReportItem.jsx';
import BrowseItems from './pages/BrowseItems.jsx';
import ItemDetails from './pages/ItemDetails.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MyClaims from './pages/MyClaims.jsx';
import ManageClaims from './pages/ManageClaims.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<BrowseItems />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report-item" 
              element={
                <ProtectedRoute>
                  <ReportItem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-claims" 
              element={
                <ProtectedRoute>
                  <MyClaims />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-claims" 
              element={
                <ProtectedRoute>
                  <ManageClaims />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;