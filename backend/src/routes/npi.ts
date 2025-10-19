import { Router } from "express";

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { t: number; data: any }>();

export function npiRouter() {
  const r = Router();
  
  r.get("/lookup/npi/:npi", async (req, res) => {
    const npi = req.params.npi;
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({ error: "invalid_npi" });
    }
    
    const now = Date.now();
    const hit = cache.get(npi);
    if (hit && now - hit.t < CACHE_TTL_MS) {
      return res.json(hit.data);
    }
    
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    
    try {
      const u = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
      const r2 = await fetch(u, { signal: ctrl.signal });
      const data = await r2.json();
      cache.set(npi, { t: now, data });
      res.json(data);
    } catch (e) {
      res.status(504).json({ timeout: true, error: "NPPES lookup timeout" });
    } finally {
      clearTimeout(to);
    }
  });
  
  return r;
}
