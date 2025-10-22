"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pilotRoutes = pilotRoutes;
const express_1 = require("express");
const store_1 = require("../services/store");
const audit_scrapbook_1 = require("../services/audit_scrapbook");
// In-memory cache for NPI lookups
const npiCache = new Map();
const NPI_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const NPI_TIMEOUT = 5000; // 5 seconds
function decodeJwt(jwt) {
    try {
        const [, payload] = jwt.split(".");
        const json = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
        return { credentialId: json.jti || json.credentialId || json.id, sub: json.sub };
    }
    catch {
        return { credentialId: undefined, sub: undefined };
    }
}
async function fetchNpiData(npi) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NPI_TIMEOUT);
    try {
        const response = await fetch(`https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Chai-VC-Platform/1.0'
            }
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`NPPES API error: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('NPI lookup timeout');
        }
        throw error;
    }
}
function pilotRoutes() {
    const r = (0, express_1.Router)();
    // Health check
    r.get("/health", (_req, res) => res.json({ ok: true, service: "backend" }));
    // Issue credential
    r.post("/issuer/credential", async (req, res) => {
        try {
            const subject = (req.body && req.body.subject) || {};
            const credentialId = `cred-${Date.now()}`;
            const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
            const payload = Buffer.from(JSON.stringify({
                credentialId,
                sub: subject.id || "did:example",
                iat: Date.now()
            })).toString("base64url");
            const jwt = `${header}.${payload}.`;
            await store_1.store.setIssued(credentialId, { jwt, subjectId: subject.id || "did:example" });
            const auditRef = await (0, audit_scrapbook_1.record)("issue", { credentialId });
            res.json({ credentialId, jwt, auditRef });
        }
        catch (error) {
            res.status(500).json({ ok: false, error: "internal_error" });
        }
    });
    // Revoke credential
    r.post("/issuer/revoke", async (req, res) => {
        try {
            const { credentialId } = req.body || {};
            if (!credentialId) {
                return res.status(400).json({ ok: false, error: "missing_credentialId" });
            }
            await store_1.store.setStatus(credentialId, "REVOKED");
            const auditRef = await (0, audit_scrapbook_1.record)("revoke", { credentialId });
            res.json({ ok: true, credentialId, auditRef });
        }
        catch (error) {
            res.status(500).json({ ok: false, error: "internal_error" });
        }
    });
    // Verify presentation - HARDENED
    r.post("/verifier/presentation", async (req, res) => {
        try {
            // Validate JSON body
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                    valid: false,
                    reason: "invalid_json_body",
                    auditRef: await (0, audit_scrapbook_1.record)("verify_error", { error: "invalid_json_body" })
                });
            }
            const { jwt } = req.body;
            // Check for missing JWT
            if (!jwt) {
                return res.status(400).json({
                    valid: false,
                    reason: "missing_jwt",
                    auditRef: await (0, audit_scrapbook_1.record)("verify_error", { error: "missing_jwt" })
                });
            }
            // Decode JWT
            const { credentialId } = decodeJwt(jwt);
            // Check for unknown credential
            if (!credentialId) {
                return res.json({
                    valid: false,
                    reason: "unknown_credential",
                    auditRef: await (0, audit_scrapbook_1.record)("verify_error", { error: "unknown_credential" })
                });
            }
            // Get credential status
            const status = await store_1.store.getStatus(credentialId);
            const valid = status === "ACTIVE";
            const reason = valid ? undefined : status.toLowerCase();
            const auditRef = await (0, audit_scrapbook_1.record)("verify", { credentialId, status });
            res.json({ valid, reason, auditRef, credentialId });
        }
        catch (error) {
            res.status(500).json({
                valid: false,
                reason: "internal_error",
                auditRef: await (0, audit_scrapbook_1.record)("verify_error", { error: "internal_error" })
            });
        }
    });
    // NPI lookup with caching
    r.post("/lookup/npi/:npi", async (req, res) => {
        try {
            const { npi } = req.params;
            // Validate NPI format (10 digits)
            if (!/^\d{10}$/.test(npi)) {
                return res.status(400).json({
                    ok: false,
                    error: "invalid_npi_format",
                    message: "NPI must be exactly 10 digits"
                });
            }
            // Check cache first
            const cached = npiCache.get(npi);
            if (cached && (Date.now() - cached.timestamp) < NPI_CACHE_TTL) {
                return res.json({
                    ok: true,
                    npi,
                    data: cached.data,
                    cached: true,
                    auditRef: await (0, audit_scrapbook_1.record)("npi_lookup_cached", { npi })
                });
            }
            // Fetch from NPPES API
            const data = await fetchNpiData(npi);
            // Cache the result
            npiCache.set(npi, { data, timestamp: Date.now() });
            res.json({
                ok: true,
                npi,
                data,
                cached: false,
                auditRef: await (0, audit_scrapbook_1.record)("npi_lookup", { npi })
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: error.message || "npi_lookup_failed",
                auditRef: await (0, audit_scrapbook_1.record)("npi_lookup_error", { npi: req.params.npi, error: error.message })
            });
        }
    });
    // FHIR Practitioner export
    r.get("/fhir/Practitioner/:id", async (req, res) => {
        try {
            const { id } = req.params;
            // Find credentials for this practitioner
            const credentials = await store_1.store.findBySubject(id);
            // Build qualifications from issued VCs
            const qualifications = credentials
                .filter(c => c.status === "ACTIVE")
                .map(c => ({
                identifier: [{
                        use: "official",
                        value: c.credentialId
                    }],
                code: {
                    coding: [{
                            system: "http://hl7.org/fhir/ValueSet/identifier-type",
                            code: "VC",
                            display: "Verifiable Credential"
                        }]
                },
                status: "active"
            }));
            const practitioner = {
                resourceType: "Practitioner",
                id,
                identifier: [{
                        use: "official",
                        value: id
                    }],
                qualification: qualifications
            };
            res.json(practitioner);
        }
        catch (error) {
            res.status(500).json({
                resourceType: "OperationOutcome",
                issue: [{
                        severity: "error",
                        code: "internal",
                        details: { text: "Failed to generate FHIR Practitioner resource" }
                    }]
            });
        }
    });
    return r;
}

