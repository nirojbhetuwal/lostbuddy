import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Basic CORS for testing
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/debug', (req, res) => {
  console.log('✅ Debug endpoint hit');
  res.json({ 
    message: 'Debug endpoint working!',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
    }
  });
});

// Test auth endpoint
app.post('/api/auth/debug', (req, res) => {
  console.log('✅ Auth debug endpoint hit', req.body);
  res.json({ 
    message: 'Auth debug working!',
    received: req.body
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔧 Debug server running on port ${PORT}`);
  console.log(`🔍 Test with: curl http://localhost:${PORT}/api/debug`);
});