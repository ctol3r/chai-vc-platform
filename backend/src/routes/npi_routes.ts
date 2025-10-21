/**
 * NPI lookup routes for Pilot P0
 * POST /lookup/npi/:npi - Lookup NPI from NPPES
 */

import { Router, Request, Response } from 'express';

export const npiRoutes = Router();

// Simple in-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const npiCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * POST /lookup/npi/:npi
 * Lookup NPI information from NPPES registry
 */
npiRoutes.post('/npi/:npi', async (req: Request, res: Response) => {
  try {
    const { npi } = req.params;

    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({
        error: 'Invalid NPI format. Must be 10 digits.'
      });
    }

    // Check cache first
    const cached = npiCache.get(npi);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }

    // Fetch from NPPES with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VitalCV-Pilot/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NPPES API returned ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      npiCache.set(npi, {
        data,
        timestamp: Date.now()
      });

      // Clean up old cache entries periodically
      if (Math.random() < 0.1) { // 10% chance
        cleanupCache();
      }

      res.status(200).json(data);

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error?.name === 'AbortError') {
        return res.status(200).json({
          timeout: true,
          message: 'NPPES lookup timed out'
        });
      }

      throw error;
    }

  } catch (error) {
    console.error('[NPI] Lookup failed:', error);
    res.status(500).json({
      error: 'Failed to lookup NPI information'
    });
  }
});

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, entry] of npiCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      npiCache.delete(key);
    }
  }
}