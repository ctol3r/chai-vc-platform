import { fetchMatching } from '../src/controllers/credential_controller';
import nock from 'nock';

test('fetchMatching allows when OPA permits', async () => {
  nock('http://localhost:8181')
    .post('/v1/data/chai/authz/allow')
    .reply(200, { result: true });

  nock('https://ai-matcher-service')
    .get('/match')
    .reply(200, { ok: true });

  const result = await fetchMatching();
  expect(result).toEqual({ ok: true });
});
