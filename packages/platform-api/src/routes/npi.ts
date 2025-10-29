import { Router } from "express";
import { z } from "zod";

export const npiRouter = Router();

const NpiLookup = z.object({ npi: z.string().regex(/^\d{10}$/) });

/**
 * NOTE:
 *  - This is a mock lookup with simple checksum validation (Luhn-10 variant for NPI).
 *  - Replace with live NPPES API integration later; keep the shape the same.
 */
function isValidNpi(npi: string) {
  // NPI Luhn algorithm with prefixing '80840' then Luhn10
  const prefix = "80840";
  const digits = (prefix + npi.slice(0, 9)).split("").map(Number);
  let sum = 0;
  for (let i = digits.length - 1, alt = true; i >= 0; i--, alt = !alt) {
    let d = digits[i];
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(npi[9]);
}

npiRouter.get("/lookup", (req, res) => {
  const parsed = NpiLookup.safeParse({ npi: req.query.npi });
  if (!parsed.success) return res.status(400).json({ error: "Invalid NPI format" });

  const { npi } = parsed.data;
  const valid = isValidNpi(npi);
  if (!valid) return res.status(404).json({ error: "NPI not found or invalid checksum" });

  // Mocked profile
  return res.json({
    npi,
    type: npi.startsWith("1") ? "INDIVIDUAL" : "ORGANIZATION",
    basic: { first_name: "Test", last_name: "Clinician", credential: "MD" },
    addresses: [],
    taxonomies: []
  });
});
