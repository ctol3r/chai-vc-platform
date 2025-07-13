// keycloak_audit_webhook.ts - audit webhook endpoint for admin events
import express, { Request, Response } from 'express';

const router = express.Router();

// POST /audit-webhook
router.post('/audit-webhook', async (req: Request, res: Response) => {
  // In a real implementation, persist event data using Prisma
  const event = req.body;
  console.log('Received Keycloak admin event', event);
  res.status(201).json({ status: 'logged' });
});

export default router;
