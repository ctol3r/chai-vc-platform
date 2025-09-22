/**
 * Minimal jest setup for backend tests.
 * Provide a global fetch to avoid network calls at import-time.
 */
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = () => Promise.resolve({ ok: true, json: async () => ({}) });
}
