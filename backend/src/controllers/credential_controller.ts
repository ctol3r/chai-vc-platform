import axios from 'axios';
import fs from 'fs';
import https from 'https';

const httpsAgent = new https.Agent({
  cert: fs.readFileSync(process.env.CLIENT_CERT || '/certs/client.crt'),
  key: fs.readFileSync(process.env.CLIENT_KEY || '/certs/client.key'),
  ca: fs.readFileSync(process.env.CA_CERT || '/certs/ca.crt'),
  rejectUnauthorized: true,
});

const OPA_URL = process.env.OPA_URL || 'http://localhost:8181/v1/data/chai/authz/allow';

export async function authorize(path: string, method: string): Promise<boolean> {
  const resp = await axios.post(OPA_URL, { input: { path, method } });
  return resp.data.result === true;
}

export async function fetchMatching(): Promise<any> {
  const allowed = await authorize('/credentials', 'POST');
  if (!allowed) {
    throw new Error('OPA policy denied request');
  }
  const resp = await axios.get('https://ai-matcher-service/match', { httpsAgent });
  return resp.data;
}
