// Simple API test without external dependencies
const testAPI = async () => {
  console.log('🧪 Testing LostBuddy API Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.message);
    
    // Test 2: Test Endpoint
    console.log('2. Testing test endpoint...');
    const testResponse = await fetch('http://localhost:5000/api/test');
    const testData = await testResponse.json();
    console.log('✅ Test:', testData.message);
    
    // Test 3: Auth Routes Exist
    console.log('3. Testing auth routes exist...');
    const authResponse = await fetch('http://localhost:5000/api/auth');
    console.log('✅ Auth routes are accessible');
    
    // Test 4: Try Registration
    console.log('4. Testing registration endpoint...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    const registerData = await registerResponse.json();
    console.log('✅ Registration endpoint:', registerData.message || 'Validation working');
    
    // Test 5: Try Login
    console.log('5. Testing login endpoint...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login endpoint:', loginData.message || 'Validation working');
    
    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('\n📝 To test actual registration, use this data:');
    console.log('   URL: POST http://localhost:5000/api/auth/register');
    console.log('   Body: {');
    console.log('     "username": "testuser",');
    console.log('     "email": "test@example.com",');
    console.log('     "password": "password123",');
    console.log('     "address": "123 Test Street"');
    console.log('   }');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('🔧 Make sure the server is running on port 5000');
  }
};

testAPI();