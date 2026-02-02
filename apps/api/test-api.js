const http = require('http');

const testEndpoint = (path) => {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
};

(async () => {
  console.log('🧪 Testing API endpoints...\n');

  const tests = [
    '/api/data/health',
    '/api/data/cities',
    '/api/data/hotels',
    '/api/data/hotels?city=Istanbul',
    '/api/data/experiences',
    '/api/data/experiences?city=Paris'
  ];

  for (const path of tests) {
    try {
      const result = await testEndpoint(path);
      console.log('✅ ' + path);
      console.log('   Status:', result.status);
      if (result.data.data) {
        console.log('   Count:', result.data.count || result.data.data.count || result.data.data.length);
      }
      console.log('');
    } catch (error) {
      console.log('❌ ' + path);
      console.log('   Error:', error.message);
      console.log('');
    }
  }

  console.log('✅ Test completed!');
  process.exit(0);
})();
