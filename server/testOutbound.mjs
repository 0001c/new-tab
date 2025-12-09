import https from 'https';

(async () => {
  const url = 'https://www.google.com/';
  const req = https.request(url, (res) => {
    console.log('STATUS_CODE:', res.statusCode);
    console.log('HEADERS:', res.headers);
    res.on('data', () => {});
    res.on('end', () => process.exit(0));
  });

  req.on('error', (err) => {
    console.error('Outbound request error:', err);
    process.exit(1);
  });

  req.end();
})();
