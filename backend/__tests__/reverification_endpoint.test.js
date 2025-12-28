const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
require('ts-node/register');
const registerCredentialRoutes = require('../src/controllers/credential_controller').default;

(async () => {
  const app = express();
  app.use(express.json());
  registerCredentialRoutes(app);
  const res = await request(app).post('/credentials/sample-id/reverify');
  assert.equal(res.status, 200);
  assert.deepStrictEqual(res.body, { id: 'sample-id', status: 'reverification_triggered' });
  console.log('reverification endpoint test passed');
})();
