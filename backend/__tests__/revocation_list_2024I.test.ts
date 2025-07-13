import assert from 'assert';
import { RevocationList2024I } from '../src/revocation/revocation_list_2024I';

export function testRevocationList2024I() {
  const rl = new RevocationList2024I();
  rl.createList('VC1', 16); // 16 bits
  rl.revoke('VC1', 3);
  assert(rl.isRevoked('VC1', 3), 'index 3 should be revoked');
  rl.restore('VC1', 3);
  assert(!rl.isRevoked('VC1', 3), 'index 3 should not be revoked after restore');
}
