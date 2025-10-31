import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { auditLog } from "../controllers/audit";
import { isValidNPI } from "../controllers/npiUtil";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: process.env.UPLOAD_DIR || "/tmp/uploads" });

/**
 * In-memory stores for pilot. Replace with Postgres/Prisma in prod.
 * TODO: Migrate to Prisma Claim and ClaimStatus models
 */
const claims: Record<string, any> = {};
const statuses: Record<string, any> = {};

// Export for use by other route files
export { claims, statuses };

/**
 * POST /api/claim/doc
 * Upload claim documents (multipart/form-data)
 */
router.post("/doc", upload.any(), async (req, res) => {
  try {
    const npi = req.body.npi;
    if (!npi || !isValidNPI(npi)) {
      return res.status(400).json({ error: "missing or invalid npi" });
    }

    const id = uuidv4();
    const files = (req.files as Express.Multer.File[]).map((f) => ({
      path: f.path,
      original: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));

    claims[id] = {
      id,
      npi,
      files,
      createdAt: Date.now(),
      createdBy: (req as any).user?.id || "anonymous",
    };

    // Create initial status
    const statusId = uuidv4();
    statuses[statusId] = {
      statusId,
      claimId: id,
      level: 1,
      message: "Uploaded",
      timestamp: new Date().toISOString(),
    };

    await auditLog((req as any).user?.id || "anonymous", "claim.doc.upload", {
      claimId: id,
      npi,
      fileCount: files.length,
    });

    return res.json({ claimId: id, statusId });
  } catch (err: any) {
    return res.status(500).json({ error: String(err.message) });
  }
});

export default router;
