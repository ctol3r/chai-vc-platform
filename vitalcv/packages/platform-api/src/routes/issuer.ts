import { Router } from "express";

export const issuerRouter = Router();

issuerRouter.post("/attest-request", (req, res) => {
  // TODO: integrate ACA-Py for Level 3
  return res.json({ ok: true, next: "ISSUER_ATTEST_PENDING" });
});
