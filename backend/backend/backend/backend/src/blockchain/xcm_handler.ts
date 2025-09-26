import { ApiPromise } from '@polkadot/api';

export async function handleXcm(api: ApiPromise, extrinsic: any) {
  if (!api) throw new Error('Polkadot API required');
  // process extrinsic defensively
  // implementation omitted (keep type loose)
  return { ok: true };
}
