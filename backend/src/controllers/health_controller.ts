import { Request, Response } from 'express';
import { preAuthorizedCodeService } from '../services/preAuthorizedCodeService';

export async function redisHealth(_req: Request, res: Response): Promise<void> {
  if (!preAuthorizedCodeService.isRedisBacked()) {
    res.status(204).end();
    return;
  }
  try {
    await preAuthorizedCodeService.checkRedisHealth();
    res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'unhealthy';
    res.status(503).json({ status: 'unhealthy', error: message });
  }
}
