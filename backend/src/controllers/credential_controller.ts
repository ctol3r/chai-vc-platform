import { Request, Response } from 'express';
import { tracer } from '../tracing';

export async function issueCredential(req: Request, res: Response): Promise<void> {
  const span = tracer.startSpan('issueCredential');
  try {
    // business logic placeholder
    res.json({ status: 'issued' });
  } finally {
    span.end();
  }
}
