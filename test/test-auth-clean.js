// Node.js 18+ has native fetch, no import needed
const BASE_URL = 'http://localhost:3001';

// Sample login data matching your app user format
const sampleLoginData = {
  android_id: "test-android-123",
  app_id: "com.ai.nutrition.calorie.tracker",
  carrier: "--",
  chid: null,
  client_version: "1.5.0",
  current_language: null,
  device_brand: "iPhone",
  device_id: "FB4FD192-9BD5-4F82-8AA8-59DD9054CCA1",
  device_model: "iPhone 15",
  email: null,
  first_name: null,
  ga_id: "GA123456789",
  imei: "FB4FD192-9BD5-4F82-8AA8-59DD9054CCA1",
  install_time: "1747823108",
  last_name: null,
  launch_num: null,
  mac: null,
  mchid: null,
  origin_language: "en",
  os: "iOS",
  os_version: "18.4",
  simulator: false,
  time_zone: "8",
  login_status: null,
  use_burned_calories: true,
  firebase_token: "firebase_token_12345"
};

async function testAuthFlow() {
  console.log('🚀 Testing Authentication Flow...\n');

  try {
    // Test 1: Login (Register new user)
    console.log('1️⃣ Testing Login/Register...');
    console.log('Connecting to:', `${BASE_URL}/auth/login`);
    
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleLoginData),
    });

    const loginResult = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginResult, null, 2));

    if (loginResult.code !== 200) {
      console.error('❌ Login failed:', loginResult.msg);
      return;
    }

    const token = loginResult.data.token;
    const user = loginResult.data.user;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');
    console.log('✅ User created with ID:', user.user_id);

    // Test 2: Get User Info with token
    console.log('\n2️⃣ Testing Get User Info...');
    const userInfoResponse = await fetch(`${BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const userInfoResult = await userInfoResponse.json();
    console.log('User Info Response:', JSON.stringify(userInfoResult, null, 2));

    if (userInfoResult.code === 200) {
      console.log('✅ Get user info successful!');
      console.log('✅ User device_id:', userInfoResult.data.device_id);
      console.log('✅ User app_id:', userInfoResult.data.app_id);
    } else {
      console.error('❌ Get user info failed:', userInfoResult.msg);
    }

    // Test 3: Test login again (should update existing user)
    console.log('\n3️⃣ Testing Login Again (Update Existing User)...');
    const loginAgainResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...sampleLoginData,
        client_version: "1.6.0", // Update client version
        firebase_token: "new_firebase_token_67890"
      }),
    });

    const loginAgainResult = await loginAgainResponse.json();
    console.log('Second Login Response:', JSON.stringify(loginAgainResult, null, 2));

    if (loginAgainResult.code === 200) {
      console.log('✅ Second login successful! (Existing user updated)');
    }

    // Test 4: Test with invalid token
    console.log('\n4️⃣ Testing Invalid Token...');
    const invalidTokenResponse = await fetch(`${BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
        'Content-Type': 'application/json',
      },
    });

    const invalidTokenResult = await invalidTokenResponse.json();
    console.log('Invalid Token Response:', JSON.stringify(invalidTokenResult, null, 2));

    if (invalidTokenResult.code === 604) {
      console.log('✅ Invalid token correctly rejected!');
    }

    // Test 5: Test without token
    console.log('\n5️⃣ Testing No Token...');
    const noTokenResponse = await fetch(`${BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const noTokenResult = await noTokenResponse.json();
    console.log('No Token Response:', JSON.stringify(noTokenResult, null, 2));

    if (noTokenResult.code === 401) {
      console.log('✅ No token correctly rejected!');
    }

    console.log('\n🎉 Authentication flow test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test with different device to simulate new user
async function testNewUser() {
  console.log('\n🆕 Testing New User Registration...');

  const newUserData = {
    ...sampleLoginData,
    device_id: "NEW-DEVICE-456-789-012",
    android_id: "new-android-456",
    device_brand: "Samsung",
    device_model: "Galaxy S24",
    os: "Android",
    os_version: "14.0",
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUserData),
    });

    const result = await response.json();
    console.log('New User Response:', JSON.stringify(result, null, 2));

    if (result.code === 200) {
      console.log('✅ New user registration successful!');
      console.log('✅ New user ID:', result.data.user.user_id);
    }
  } catch (error) {
    console.error('❌ New user test failed:', error);
  }
}

// Run tests
async function runAllTests() {
  await testAuthFlow();
  await testNewUser();
}

runAllTests().catch(console.error);
