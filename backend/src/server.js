const http = require('http');
const { signCredential } = require('./controllers/credential_controller');
const { anchorHashOnChain } = require('./blockchain/blockchain_integration');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/issue-vc') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const credential = JSON.parse(body);
        const signedVc = signCredential(credential);
        const hash = crypto.createHash('sha256').update(JSON.stringify(signedVc)).digest('hex');
        const txId = await anchorHashOnChain(hash);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ signedVc, txId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credential or internal error' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
