import { verifyStatusProof as verifyToken } from '../../blockchain/acaPy';

export async function verifyProof(
  _parent: unknown,
  args: { presentationToken: string }
) {
  const { ok, reason } = await verifyToken(args.presentationToken);
  return { valid: ok, reason };
}

export const VerifierMutation = {
  verifyProof,
};
