import express from 'express';
import { triggerManualReverification } from '../blockchain/kinetic_layer';

export default function registerCredentialRoutes(app: express.Application | express.Router) {
  const router = express.Router();

  // Endpoint to manually trigger re-verification via the kinetic layer
  router.post('/credentials/:id/reverify', async (req, res) => {
    const credentialId = req.params.id;
    await triggerManualReverification(credentialId);
    res.json({ id: credentialId, status: 'reverification_triggered' });
  });

  app.use(router);
}
