/**
 * NPI lookup routes for Pilot P0.
 * POST /lookup/npi/:npi - Lookup practitioner by NPI number
 */

import { Router, Request, Response } from 'express';

const router = Router();

// In-memory cache with 10-minute TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const npiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * POST /lookup/npi/:npi
 * Lookup practitioner information from NPPES registry
 */
router.post('/npi/:npi', async (req: Request, res: Response) => {
  try {
    const { npi } = req.params;

    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({
        error: 'invalid_npi',
        message: 'NPI must be exactly 10 digits',
      });
    }

    // Check cache
    const cached = npiCache.get(npi);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log('[NPI_CACHE_HIT]', { npi });
      return res.status(200).json(cached.data);
    }

    // Fetch from NPPES with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).json({
          error: 'nppes_error',
          message: 'NPPES lookup failed',
        });
      }

      const data = await response.json();

      // Cache the result
      npiCache.set(npi, {
        data,
        timestamp: Date.now(),
      });

      return res.status(200).json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return res.status(200).json({
          timeout: true,
          message: 'NPPES lookup timed out',
        });
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error('[NPI_ERROR]', { message: error?.message });
    return res.status(500).json({
      error: 'internal_error',
      message: 'NPI lookup failed',
    });
  }
});

export default router;
