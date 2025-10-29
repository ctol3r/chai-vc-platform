import { Router } from "express";

export const didRouter = Router();

didRouter.post("/link", (_req, res) => {
  // TODO: map NPI <-> DID on Substrate pallet
  return res.json({ ok: true, linked: true });
});
