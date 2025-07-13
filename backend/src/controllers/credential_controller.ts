import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { type, issuedTo } = req.body || {};
  if (!type || !issuedTo) {
    return res.status(400).json({ error: 'type and issuedTo are required' });
  }

  const credential = {
    id: Date.now().toString(),
    type,
    issuedTo,
  };

  res.status(201).json(credential);
});

export default router;
