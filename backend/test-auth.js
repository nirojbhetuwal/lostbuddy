import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication API...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Test endpoint
    console.log('\n2. Testing public endpoint...');
    const testResponse = await axios.get(`${API_BASE}/test`);
    console.log('✅ Public endpoint:', testResponse.data.message);

    // Test 3: Register a user
    console.log('\n3. Testing user registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      address: '123 Test Street, Test City'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data.message);
      console.log('   User:', registerResponse.data.data.user.username);
      console.log('   Token received:', !!registerResponse.data.data.token);
      
      const token = registerResponse.data.data.token;

      // Test 4: Get user profile with token
      console.log('\n4. Testing protected route with token...');
      const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected route access successful');
      console.log('   User profile:', profileResponse.data.data.user.username);

      // Test 5: Login with same user
      console.log('\n5. Testing user login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login successful:', loginResponse.data.message);

    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, testing login instead...');
        
        // Test login instead
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        console.log('✅ Login successful:', loginResponse.data.message);
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📝 Next steps:');
    console.log('   - Use the frontend at http://localhost:5173');
    console.log('   - Or use API clients like Postman/Thunder Client');
    console.log('   - Test with: demo@lostbuddy.com / demo123');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message);
      console.error('   Errors:', error.response.data?.errors);
    } else {
      console.error('   Error:', error.message);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure server is running on port 5000');
    console.log('   - Check MongoDB connection');
    console.log('   - Verify environment variables');
  }
}

testAuth();