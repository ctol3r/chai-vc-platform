import assert from 'assert';
import { getProviderInfo } from '../src/controllers/credential_controller';

(async () => {
  const result = await getProviderInfo('0000000000');
  assert.strictEqual(result.manualEntryRequired, true, 'Should require manual entry when lookup fails');
  console.log('Test passed');
})();
