import { Router } from 'express';
import { verifyCredentialByHashFHIR } from '../controllers/verification_controller';

const router = Router();

router.get('/verifyCredential', async (req, res) => {
  const hash = String(req.query.hash || '');
  if (!hash) return res.status(400).json({ error: 'hash required' });
  try {
    const vr = await verifyCredentialByHashFHIR(hash);
    res.json(vr);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'verify failed' });
  }
});

export default router;
