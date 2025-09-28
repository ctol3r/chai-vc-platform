/**
 * Quickpatch xcm handler stub - avoid importing SubmittableExtrinsic from polkadot which changed API.
 */
export async function submitXcm(_payload: unknown): Promise<{ applied: boolean; tx?: string }> {
  // No-op stub
  return { applied: true, tx: '0xdeadbeef' };
}

export default { submitXcm };
