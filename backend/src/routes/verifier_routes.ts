import { Router } from 'express';
import { getCredentialStatus, verifyPresentation, type ProofPayload } from '../controllers/verifier_controller';

export const router = Router();

const isProofPayload = (value: unknown): value is ProofPayload => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.credential === 'object' && typeof record.proof === 'object';
};

interface PresentationRequest {
  credentialId: string;
  vpToken: string;
  nonce: string;
  audience: string;
}

const isPresentationRequest = (value: unknown): value is PresentationRequest => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.credentialId === 'string' &&
    typeof record.vpToken === 'string' &&
    typeof record.nonce === 'string' &&
    typeof record.audience === 'string'
  );
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

// MVP: Verifier presentation endpoint
router.post('/verifier/presentation', async (req, res) => {
  try {
    if (!isPresentationRequest(req.body)) {
      return res.status(400).json({
        error: 'Invalid request format',
        required: ['credentialId', 'vpToken', 'nonce', 'audience']
      });
    }

    const { credentialId, vpToken, nonce, audience } = req.body;
    const result = await verifyPresentation({ credentialId, vpToken, nonce, audience });

    res.json({
      credentialId,
      status: result.status,
      details: result.details
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to verify presentation' });
  }
});
