const http = require('http');

// Function to make an HTTP request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      // Collect response data
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // Finish response
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Response data:', JSON.stringify(parsedData, null, 2));
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          console.log('Raw response:', responseData);
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    // Handle errors
    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });
    
    // Send data if provided
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  const host = 'localhost';
  const port = 3001;
  
  console.log(`Testing API at http://${host}:${port}\n`);
  
  try {
    // Test 1: Root endpoint
    console.log('Test 1: GET /');
    await makeRequest({
      host,
      port,
      path: '/',
      method: 'GET'
    });
    
    // Test 2: Get reference virtues/flaws
    console.log('\nTest 2: GET /api/reference-virtues-flaws');
    await makeRequest({
      host,
      port,
      path: '/api/reference-virtues-flaws',
      method: 'GET'
    });
    
    // Test 3: Get character
    console.log('\nTest 3: GET /api/characters/1');
    await makeRequest({
      host,
      port,
      path: '/api/characters/1',
      method: 'GET'
    });
    
    // Test 4: Get character virtues/flaws
    console.log('\nTest 4: GET /api/characters/1/virtues-flaws');
    await makeRequest({
      host,
      port,
      path: '/api/characters/1/virtues-flaws',
      method: 'GET'
    });
    
    // Test 5: Add virtue/flaw
    console.log('\nTest 5: POST /api/characters/1/virtues-flaws');
    await makeRequest({
      host,
      port,
      path: '/api/characters/1/virtues-flaws',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      referenceVirtueFlawId: 1,
      is_house_virtue_flaw: false
    });
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
  }
}

// Run the tests
runTests();