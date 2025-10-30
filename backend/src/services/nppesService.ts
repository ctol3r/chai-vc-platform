import fetch from "node-fetch";
import Redis from "ioredis";
import prisma from "../graphql/prisma_client";
import { isValidNPI } from "../controllers/npiUtil";
import { auditLog } from "../controllers/audit";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const NPPES_BASE = "https://npiregistry.cms.hhs.gov/api"; // fallback; prefer proxy set in env

export async function lookupNPI(npi: string, opts: { bypassCache?: boolean } = {}) {
  if (!isValidNPI(npi)) throw new Error("invalid_npi_format");
  const cacheKey = `nppes:npi:${npi}`;
  if (!opts.bypassCache) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // Use an internal proxy if set (avoids CORS & centralizes rate limiting)
  const proxyUrl = process.env.NPPES_PROXY_URL;
  let data;
  if (proxyUrl) {
    const resp = await fetch(`${proxyUrl}/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npi }),
    });
    if (!resp.ok) throw new Error("nppes_proxy_error");
    data = await resp.json();
  } else {
    // direct call (respect rate limits)
    const resp = await fetch(`${NPPES_BASE}/?number=${npi}&version=2.1`);
    if (!resp.ok) throw new Error("nppes_error");
    data = await resp.json();
  }

  // Normalize into a small provider object:
  const provider = {
    npi,
    name: data?.results?.[0]?.basic?.name || null,
    enumeration_type: data?.results?.[0]?.enumeration_type || null,
    addresses: data?.results?.[0]?.addresses || [],
    raw: data,
    last_verified_at: new Date().toISOString(),
  };

  // persist/upsert to Providers table (Prisma example - adapt to your ORM)
  // Note: This assumes a Provider model exists in Prisma schema
  // If not, comment out this section or create the model
  try {
    await prisma.provider.upsert({
      where: { npi },
      update: { data: provider, last_verified_at: new Date() },
      create: { npi, data: provider, last_verified_at: new Date() },
    });
  } catch (error) {
    // If Provider model doesn't exist yet, log but don't fail
    console.warn("Provider model not found in Prisma schema. Skipping database persistence.", error);
  }

  // cache TTL 24h
  await redis.set(cacheKey, JSON.stringify(provider), "EX", 60 * 60 * 24);

  // audit that a lookup happened (no PHI besides npi, which is allowed for credentialing)
  await auditLog("system", "npi.lookup", { npi, source: proxyUrl ? "proxy" : "direct" });

  return provider;
}

// helper: forced revalidation (used by worker)
export async function refreshNPI(npi: string) {
  return lookupNPI(npi, { bypassCache: true });
}
