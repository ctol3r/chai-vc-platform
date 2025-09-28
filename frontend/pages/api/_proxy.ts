import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const shouldForwardBody = (method?: string) => {
  if (!method) return false;
  const upper = method.toUpperCase();
  return upper !== 'GET' && upper !== 'HEAD';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pathParam = req.query.path;
    const suffix = Array.isArray(pathParam)
      ? pathParam.join('/')
      : typeof pathParam === 'string'
        ? pathParam
        : '';

    const targetUrl = `${BACKEND}${suffix ? (suffix.startsWith('/') ? suffix : `/${suffix}`) : ''}`;

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...(req.headers['content-type'] ? { 'Content-Type': req.headers['content-type'] as string } : {}),
        ...(req.headers['authorization'] ? { Authorization: req.headers['authorization'] as string } : {}),
      },
      body: shouldForwardBody(req.method)
        ? typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {})
        : undefined,
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);

    const text = await upstream.text();
    res.send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: 'proxy-failed', message });
  }
}
