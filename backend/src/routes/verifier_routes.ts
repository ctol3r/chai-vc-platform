import { Router } from 'express';
import { getCredentialStatus, verifyPresentation } from '../controllers/verifier_controller';

export const router = Router();

router.get('/verifier/credential/:credentialId/status', async (req, res) => {
  try {
    const status = await getCredentialStatus(req.params.credentialId);
    res.json({ credentialId: req.params.credentialId, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch credential status' });
  }
});

router.post('/verifier/presentation', async (req, res) => {
  try {
    const { jwt } = req.body;
    if (!jwt) {
      return res.status(400).json({ error: 'jwt required' });
    }
    const result = await verifyPresentation(jwt);
    res.json(result);
  } catch (err) {
    console.error('Verify presentation error:', err);
    res.status(500).json({ error: 'Failed to verify presentation' });
  }
});
