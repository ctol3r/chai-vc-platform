globalThis.fetch = globalThis.fetch || jest.fn(() => Promise.resolve({ ok: true, json: () => ({}) }));
