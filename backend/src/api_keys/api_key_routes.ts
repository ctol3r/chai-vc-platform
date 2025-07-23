import { Router } from 'express';
import { listKeys, createKey, rotateKey, deleteKey } from './api_key_service';

export const apiKeyRouter = Router();

apiKeyRouter.get('/', async (_req, res) => {
  const keys = await listKeys();
  const safe = keys.map(k => ({ id: k.id, scopes: k.scopes, createdAt: k.createdAt, updatedAt: k.updatedAt }));
  res.json(safe);
});

apiKeyRouter.post('/', async (req, res) => {
  const scopes = Array.isArray(req.body.scopes) ? req.body.scopes : [];
  const key = await createKey(scopes);
  res.json({ id: key.id, token: key.token });
});

apiKeyRouter.post('/:id/rotate', async (req, res) => {
  const key = await rotateKey(req.params.id);
  if (!key) return res.sendStatus(404);
  res.json({ token: key.token });
});

apiKeyRouter.delete('/:id', async (req, res) => {
  await deleteKey(req.params.id);
  res.sendStatus(204);
});
