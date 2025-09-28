"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// state_license_checker.test.ts - basic usage test for the license checker
const { checkLicenseViaApi, scrapeLicenseStatus } = require('../src/licensing/state_license_checker');

describe('state license checker', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('checkLicenseViaApi returns null when API is missing', async () => {
    const res = await checkLicenseViaApi('XX', '12345');
    expect(res).toBeNull();
  });

  test('scrapeLicenseStatus parses HTML snippets', async () => {
    const html = `<div id='status'>Active</div><span id='exp'>2025-12-31</span>`;
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => html,
    });

    const data = await scrapeLicenseStatus('https://example.test/license', { status: '#status', expiration: '#exp' });
    expect(data.status).toBe('Active');
    expect(data.expirationDate).toBe('2025-12-31');
  });
});
