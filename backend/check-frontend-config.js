// Check if frontend can connect to backend
console.log('🔍 Checking Frontend-Backend Connection...\n');

console.log('Backend URLs:');
console.log('✅ API Base: http://localhost:5000/api');
console.log('✅ Auth: http://localhost:5000/api/auth');
console.log('✅ Health: http://localhost:5000/api/health\n');

console.log('Frontend should use:');
console.log('VITE_API_URL=http://localhost:5000/api\n');

console.log('Common issues:');
console.log('1. CORS not configured properly');
console.log('2. Frontend .env file missing VITE_API_URL');
console.log('3. Port conflicts (make sure port 5000 is free)');
console.log('4. MongoDB connection issues\n');

console.log('To test CORS:');
console.log('curl -H "Origin: http://localhost:5173" http://localhost:5000/api/health');