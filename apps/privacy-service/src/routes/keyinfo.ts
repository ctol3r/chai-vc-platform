import { Router } from 'express';
import { listKeys } from '../lib/keyinfo';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ keys: listKeys() });
});

export default router;
