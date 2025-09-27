import { Router } from 'express';
import { verifyProof, type VerifyRequest } from '../lib/verifier';

const router = Router();

router.post('/', (req, res, next) => {
  try {
    const body = req.body as Partial<VerifyRequest>;

    if (!body || typeof body.credential !== 'object' || typeof body.proof !== 'object') {
      return res.status(400).json({ error: 'credential and proof are required' });
    }

    const result = verifyProof({
      // Shallow copy to avoid mutations
      credential: body.credential as VerifyRequest['credential'],
      proof: body.proof as VerifyRequest['proof'],
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;
