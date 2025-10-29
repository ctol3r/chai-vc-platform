import { Router } from "express";
import type { RequestHandler } from "express";
import type multer from "multer";
import { z } from "zod";

const ClaimBasic = z.object({
  npi: z.string().regex(/^\d{10}$/),
  email: z.string().email(),
  phone: z.string().optional()
});

const VerifyPin = z.object({
  npi: z.string().regex(/^\d{10}$/),
  pin: z.string().min(4).max(8)
});

const ClaimDoc = z.object({
  npi: z.string().regex(/^\d{10}$/)
});

export function claimRouter(upload: multer.Multer) {
  const r = Router();

  r.post("/basic", (req, res) => {
    const parsed = ClaimBasic.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
    // TODO: persist + send PIN out-of-band
    return res.json({ level: 1, status: "PIN_SENT" });
  });

  r.post("/verify-pin", (req, res) => {
    const parsed = VerifyPin.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
    // TODO: verify real PIN
    return res.json({ level: 1, status: "PIN_VERIFIED" });
  });

  r.post("/doc", upload.fields([{ name: "license", maxCount: 1 }, { name: "selfie", maxCount: 1 }]) as RequestHandler, (req, res) => {
    const parsed = ClaimDoc.safeParse({ npi: req.body?.npi });
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
    // TODO: OCR + liveness; for now simulate pass
    return res.json({ level: 2, status: "DOCS_ACCEPTED" });
  });

  r.get("/status", (req, res) => {
    const npi = String(req.query.npi || "");
    if (!/^\d{10}$/.test(npi)) return res.status(400).json({ error: "Invalid NPI" });
    // TODO: read from DB; mock Level 2 attained
    return res.json({ npi, level: 2, status: "CLAIM_PROGRESS" });
  });

  return r;
}
