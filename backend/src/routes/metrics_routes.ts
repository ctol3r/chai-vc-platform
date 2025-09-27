import { Router } from 'express';
import registry from '../metrics/registry';

const router = Router();

router.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.send(await registry.metrics());
});

export default router;
