const assert = require('assert');
const { createServer } = require('http');
const { sendClinicianToHRIS } = require('../src/hris/hris_webhook');

async function run() {
  const clinician = { id: '1', name: 'Alice', role: 'RN' };

  const server = createServer((req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        assert.strictEqual(req.method, 'POST');
        assert.strictEqual(req.headers['content-type'], 'application/json');
        const data = JSON.parse(body);
        assert.deepStrictEqual(data, clinician);
        res.statusCode = 200;
        res.end('ok');
      } finally {
        server.close();
      }
    });
  });

  await new Promise(resolve => server.listen(3456, resolve));
  process.env.HRIS_WEBHOOK_URL = 'http://localhost:3456/';
  await sendClinicianToHRIS(clinician);
}

run();
