// Test script to demonstrate API endpoints
// Run this with: node test-api.js

const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Testing Koa Backend API\n');

  try {
    // Test health check
    console.log('1. Testing Health Check (GET /)');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log(`Status: ${health.status}`);
    console.log(`Response:`, health.data);
    console.log('');

    // Test API status
    console.log('2. Testing API Status (GET /api/status)');
    const status = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/status',
      method: 'GET'
    });
    console.log(`Status: ${status.status}`);
    console.log(`Response:`, status.data);
    console.log('');

    // Test get all users
    console.log('3. Testing Get All Users (GET /api/users)');
    const users = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET'
    });
    console.log(`Status: ${users.status}`);
    console.log(`Response:`, users.data);
    console.log('');

    // Test create user
    console.log('4. Testing Create User (POST /api/users)');
    const newUser = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { name: 'Test User', email: 'test@example.com' });
    console.log(`Status: ${newUser.status}`);
    console.log(`Response:`, newUser.data);
    console.log('');

    // Test get user by ID
    console.log('5. Testing Get User by ID (GET /api/users/1)');
    const userById = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/1',
      method: 'GET'
    });
    console.log(`Status: ${userById.status}`);
    console.log(`Response:`, userById.data);
    console.log('');

    // Test API info
    console.log('6. Testing API Info (GET /api/info)');
    const info = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/info',
      method: 'GET'
    });
    console.log(`Status: ${info.status}`);
    console.log(`Response:`, info.data);
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
