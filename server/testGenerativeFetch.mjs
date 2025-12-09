import https from 'https';

(async () => {
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'node-fetch-test/1.0'
    },
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log('STATUS_CODE:', res.statusCode);
    console.log('HEADERS:', res.headers);
    res.on('data', () => {});
    res.on('end', () => process.exit(0));
  });

  req.on('timeout', () => {
    console.error('Request timed out');
    req.destroy();
    process.exit(1);
  });

  req.on('error', (err) => {
    console.error('Generative API outbound error:', err);
    if (err && err.code) console.error('Error code:', err.code);
    process.exit(1);
  });

  req.end();
})();
