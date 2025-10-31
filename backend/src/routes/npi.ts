import express from "express";
import { lookupNPI } from "../services/nppesService";
import { auditLog } from "../controllers/audit";
import { isValidNPI } from "../controllers/npiUtil";

const router = express.Router();

/**
 * POST /api/npi/lookup
 * Lookup NPI information - integrated with existing NPPES service
 */
router.post("/lookup", async (req, res) => {
  try {
    const { npi } = req.body;
    if (!npi) {
      return res.status(400).json({ error: "missing npi" });
    }

    // Use existing NPI validation and lookup service
    if (!isValidNPI(npi)) {
      return res.status(400).json({ error: "invalid npi format" });
    }

    // Use existing NPPES service (handles caching, DB persistence)
    const provider = await lookupNPI(npi);

    // Format response similar to original stub but with real data
    const info = {
      npi: provider.npi,
      type: provider.enumeration_type || "Type 1",
      name: provider.name || null,
      taxonomy: provider.raw?.results?.[0]?.taxonomies?.map((t: any) => t.code) || [],
      verified: !!provider.name,
      provider,
    };

    await auditLog("system", "npi.lookup.api", { npi });
    return res.json(info);
  } catch (err: any) {
    await auditLog("system", "npi.lookup.api.error", { error: String(err.message) });
    return res.status(500).json({ error: String(err.message) });
  }
});

export default router;
