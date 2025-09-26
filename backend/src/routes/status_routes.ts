import { Router } from 'express';
import { getStatus, revokeCredential } from '../controllers/status_controller';

export const router = Router();

// GET /api/status/:id
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Credential ID is required' });
    }

    const result = await getStatus(id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch credential status' });
  }
});

// POST /api/status/revoke (admin mock)
router.post('/status/revoke', async (req, res) => {
  try {
    const { credentialId, reason } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId is required' });
    }

    const result = await revokeCredential(credentialId, reason);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to revoke credential' });
  }
});