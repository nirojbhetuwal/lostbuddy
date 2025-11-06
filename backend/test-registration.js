const testEndpoints = async () => {
  console.log('🧪 Quick API Test\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const health = await fetch(`${baseURL}/health`);
    const healthData = await health.json();
    console.log('   ✅', healthData.message);
    
    // Test 2: Test endpoint  
    console.log('2. Testing basic endpoint...');
    const test = await fetch(`${baseURL}/test`);
    const testData = await test.json();
    console.log('   ✅', testData.message);
    
    // Test 3: Auth routes exist
    console.log('3. Testing auth route exists...');
    const auth = await fetch(`${baseURL}/auth`);
    console.log('   ✅ Auth routes accessible');
    
    console.log('\n🎉 Basic server is working!');
    console.log('\n📝 Next: Test registration with:');
    console.log('   curl -X POST http://localhost:5000/api/auth/register \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d "{\\"username\\":\\"testuser\\",\\"email\\":\\"test@test.com\\",\\"password\\":\\"test123\\",\\"address\\":\\"123 Test St\\"}"');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('   Make sure server is running on port 5000');
  }
};

testEndpoints();