// Detox end-to-end test placeholder for iOS and Android
// Requires Expo Go binaries and device configuration.

describe('wallet key flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('generates and unlocks key', async () => {
    await element(by.id('generate-key')).tap();
    await expect(element(by.id('key-generated'))).toBeVisible();
    await element(by.id('unlock-key')).tap();
    await expect(element(by.id('key-value'))).toBeVisible();
  });
});
