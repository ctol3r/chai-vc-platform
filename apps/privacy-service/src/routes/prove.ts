import { Router } from 'express';
import { generateProof, type ProveRequest } from '../lib/prover';

const router = Router();

router.post('/', (req, res, next) => {
  try {
    const body = req.body as Partial<ProveRequest>;

    if (!body || typeof body.subjectId !== 'string' || typeof body.claims !== 'object') {
      return res.status(400).json({ error: 'subjectId and claims are required' });
    }

    const proofRecord = generateProof({
      subjectId: body.subjectId,
      claims: body.claims,
      audience: body.audience,
      revealFields: Array.isArray(body.revealFields) ? body.revealFields : undefined,
    });

    return res.status(200).json(proofRecord);
  } catch (err) {
    return next(err);
  }
});

export default router;
