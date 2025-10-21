/**
 * NPI lookup routes
 * Fetches from NPPES registry with caching and timeout
 */

import { Router, Request, Response } from 'express';

const router = Router();

// In-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const npiCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds
const REQUEST_TIMEOUT = 5000; // 5 seconds timeout

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Fetch from NPPES with timeout
 */
async function fetchNPPES(npi: string, signal: AbortSignal): Promise<any> {
  const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
  
  try {
    const response = await fetch(url, {
      signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VitalCV/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NPPES API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('timeout');
    }
    throw error;
  }
}

/**
 * POST /lookup/npi/:npi
 * Lookup NPI with caching and timeout
 */
router.post('/lookup/npi/:npi', async (req: Request, res: Response) => {
  try {
    const { npi } = req.params;
    
    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({
        error: 'Invalid NPI format. Must be 10 digits.',
        valid: false
      });
    }
    
    // Check cache first
    const cached = npiCache.get(npi);
    if (cached && isCacheValid(cached)) {
      console.log(`[NPI] Cache hit for ${npi}`);
      return res.status(200).json(cached.data);
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      // Fetch from NPPES
      console.log(`[NPI] Fetching from NPPES for ${npi}`);
      const data = await fetchNPPES(npi, controller.signal);
      clearTimeout(timeoutId);
      
      // Cache the result
      npiCache.set(npi, {
        data,
        timestamp: Date.now()
      });
      
      // Clean old cache entries periodically
      if (npiCache.size > 1000) {
        // Remove expired entries
        const entriesToDelete: string[] = [];
        npiCache.forEach((entry, key) => {
          if (!isCacheValid(entry)) {
            entriesToDelete.push(key);
          }
        });
        entriesToDelete.forEach(key => npiCache.delete(key));
      }
      
      return res.status(200).json(data);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.message === 'timeout') {
        console.warn(`[NPI] Timeout for ${npi}`);
        return res.status(200).json({
          timeout: true,
          message: 'NPPES lookup timed out after 5 seconds'
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('NPI lookup error:', error);
    res.status(500).json({
      error: 'Failed to lookup NPI',
      message: String(error)
    });
  }
});

/**
 * GET /lookup/npi/:npi
 * Alternative GET endpoint for NPI lookup
 */
router.get('/lookup/npi/:npi', async (req: Request, res: Response) => {
  try {
    const { npi } = req.params;
    
    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({
        error: 'Invalid NPI format. Must be 10 digits.',
        valid: false
      });
    }
    
    // Check cache first
    const cached = npiCache.get(npi);
    if (cached && isCacheValid(cached)) {
      console.log(`[NPI] Cache hit for ${npi}`);
      return res.status(200).json(cached.data);
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      // Fetch from NPPES
      console.log(`[NPI] Fetching from NPPES for ${npi}`);
      const data = await fetchNPPES(npi, controller.signal);
      clearTimeout(timeoutId);
      
      // Cache the result
      npiCache.set(npi, {
        data,
        timestamp: Date.now()
      });
      
      return res.status(200).json(data);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.message === 'timeout') {
        console.warn(`[NPI] Timeout for ${npi}`);
        return res.status(200).json({
          timeout: true,
          message: 'NPPES lookup timed out after 5 seconds'
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('NPI lookup error:', error);
    res.status(500).json({
      error: 'Failed to lookup NPI',
      message: String(error)
    });
  }
});

export default router;