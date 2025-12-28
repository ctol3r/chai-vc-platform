import { generateAndStoreKey, getKeyWithBiometrics, keyExists } from '../src/keyManager';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

describe('key manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates and stores a 32-byte hex key', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
    const key = await generateAndStoreKey();
    expect(key).toHaveLength(64);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('wallet_key', key);
  });

  test('retrieves key after successful biometric auth', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: true });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('abcd');
    const key = await getKeyWithBiometrics();
    expect(key).toBe('abcd');
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
  });

  test('throws when biometric auth fails', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValueOnce({ success: false });
    await expect(getKeyWithBiometrics()).rejects.toThrow('Authentication failed');
  });

  test('keyExists reflects presence', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    expect(await keyExists()).toBe(false);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('abcd');
    expect(await keyExists()).toBe(true);
  });
});
