import { Router, Request, Response } from 'express';
import { issueCredential } from '../controllers/issuer_controller';

const router = Router();

router.post('/issuer/credential', async (req: Request, res: Response) => {
  try {
    const result = await issueCredential(req.body);
    res.json(result);
  } catch (error) {
    console.error('Issue credential error:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

router.post('/issuer/revoke', async (req: Request, res: Response) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId required' });
    }
    res.json({ ok: true, credentialId });
  } catch (error) {
    console.error('Revoke credential error:', error);
    res.status(500).json({ error: 'Failed to revoke credential' });
  }
});

export default router;
