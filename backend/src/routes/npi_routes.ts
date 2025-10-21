import { Router } from 'express';

const cache = new Map<string, { data: any; expiresAt: number }>();
const TEN_MIN_MS = 10 * 60 * 1000;

export const npiRoutes = Router();

npiRoutes.post('/lookup/npi/:npi', async (req, res) => {
  try {
    const npi = String(req.params.npi || '').trim();
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({ error: 'invalid_npi' });
    }

    const cached = cache.get(npi);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return res.status(200).json(cached.data);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;

    const useFetch: any = (globalThis as any).fetch;
    if (!useFetch) {
      // Environment without fetch support: return timeout response to keep pilot simple
      return res.status(200).json({ timeout: true });
    }

    let data: any;
    try {
      const resp = await useFetch(url, { signal: controller.signal });
      data = await resp.json();
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return res.status(200).json({ timeout: true });
      }
      return res.status(502).json({ error: 'upstream_error' });
    } finally {
      clearTimeout(timeout);
    }

    cache.set(npi, { data, expiresAt: now + TEN_MIN_MS });
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'npi_lookup_failed' });
  }
});
