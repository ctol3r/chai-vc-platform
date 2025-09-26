import { Router } from 'express';
import { getCredentialStatus, type ProofPayload } from '../controllers/verifier_controller';

export const router = Router();

const isProofPayload = (value: unknown): value is ProofPayload => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.credential === 'object' && typeof record.proof === 'object';
};

router.post('/verifier/credential/:credentialId/status', async (req, res) => {
  try {
    const { credentialId } = req.params;
    const proofPayload = isProofPayload(req.body) ? req.body : undefined;
    const result = await getCredentialStatus(credentialId, proofPayload);
    res.json({ credentialId, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to verify credential status' });
  }
});

router.get('/verifier/credential/:credentialId/status', async (req, res) => {
  try {
    const { credentialId } = req.params;
    const result = await getCredentialStatus(credentialId);
    res.json({ credentialId, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch credential status' });
  }
});
