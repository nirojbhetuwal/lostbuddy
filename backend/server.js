import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import claimRoutes from './routes/claims.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS configuration - VERY PERMISSIVE FOR TESTING
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check - should always work
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'LostBuddy Backend is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'API route not found: ' + req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 LostBuddy Server Started Successfully!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`   ✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`   ✅ Test: http://localhost:${PORT}/api/test`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   📦 Items: http://localhost:${PORT}/api/items`);
  console.log(`   🏷️ Claims: http://localhost:${PORT}/api/claims`);
  console.log(`   ⚡ Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   🔔 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`\n🔧 CORS: Enabled for all origins (development)`);
  console.log(`🗄️ Database: ${process.env.MONGODB_URI ? 'Connected' : 'Check .env'}`);
});