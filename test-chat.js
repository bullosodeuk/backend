const http = require('http');
const crypto = require('crypto');

// Generate a test UUID for userId (or use a fixed one)
const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // Fixed UUID for testing
// Or generate a random one: crypto.randomUUID()

const data = JSON.stringify({
  userId: testUserId,
  message: 'Say "Hello World"'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/chat/message',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  console.log('\n--- Stream Events ---\n');

  res.on('data', (chunk) => {
    console.log(chunk.toString());
  });

  res.on('end', () => {
    console.log('\n--- Stream Ended ---');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
