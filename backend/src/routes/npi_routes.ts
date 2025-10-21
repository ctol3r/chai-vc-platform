/**
 * NPI lookup routes for Pilot P0 API
 * Handles NPPES v2.1 API lookups with timeout and caching
 */

import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { recordNpiLookup } from '../services/audit';

const router = Router();

// In-memory cache for NPI lookups
const npiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * POST /lookup/npi/:npi
 * Lookup NPI information with timeout and caching
 */
router.post('/npi/:npi', async (req: Request, res: Response) => {
  try {
    const { npi } = req.params;
    
    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({
        valid: false,
        reason: 'invalid_npi_format'
      });
    }
    
    // Check cache first
    const cached = npiCache.get(npi);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('NPI cache hit:', npi);
      await recordNpiLookup(npi, true);
      return res.json(cached.data);
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Fetch from NPPES API
      const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VitalCV-Pilot/1.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`NPPES API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      npiCache.set(npi, {
        data,
        timestamp: Date.now(),
      });
      
      // Record successful lookup
      await recordNpiLookup(npi, true);
      
      res.json(data);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.warn('NPI lookup timeout:', npi);
        await recordNpiLookup(npi, false);
        return res.json({ timeout: true });
      }
      
      throw error;
    }
    
  } catch (error: any) {
    console.error('NPI lookup error:', error);
    await recordNpiLookup(req.params.npi, false);
    res.status(500).json({
      valid: false,
      reason: 'lookup_failed'
    });
  }
});

/**
 * GET /lookup/npi/:npi
 * Alternative GET endpoint for NPI lookup
 */
router.get('/npi/:npi', async (req: Request, res: Response) => {
  try {
    const { npi } = req.params;
    
    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(npi)) {
      return res.status(400).json({
        valid: false,
        reason: 'invalid_npi_format'
      });
    }
    
    // Check cache first
    const cached = npiCache.get(npi);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('NPI cache hit:', npi);
      await recordNpiLookup(npi, true);
      return res.json(cached.data);
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Fetch from NPPES API
      const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'VitalCV-Pilot/1.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`NPPES API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      npiCache.set(npi, {
        data,
        timestamp: Date.now(),
      });
      
      // Record successful lookup
      await recordNpiLookup(npi, true);
      
      res.json(data);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.warn('NPI lookup timeout:', npi);
        await recordNpiLookup(npi, false);
        return res.json({ timeout: true });
      }
      
      throw error;
    }
    
  } catch (error: any) {
    console.error('NPI lookup error:', error);
    await recordNpiLookup(req.params.npi, false);
    res.status(500).json({
      valid: false,
      reason: 'lookup_failed'
    });
  }
});

export default router;