const http = require('http');

const host = 'localhost';
const port = 3001;
const path = '/api/characters/1/virtues-flaws';
const data = {
  referenceVirtueFlawId: 564,
  is_house_virtue_flaw: false
};

// Create options for the request
const options = {
  host,
  port,
  path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQwNTk0NjMzLCJleHAiOjE3NDA2ODEwMzN9.a-vC3XSnuoAeS7oZKQQX9bDLNbvVHekIZrfdfU7L2V4'
  }
};

// Create the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response completed');
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Response data:', JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

// Handle request errors
req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

// Write data to the request
const jsonData = JSON.stringify(data);
console.log(`Sending POST request to ${host}:${port}${path}`);
console.log(`Request body: ${jsonData}`);
req.write(jsonData);

// End the request
req.end();