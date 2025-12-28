import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { getRandomBytes } from 'expo-crypto';

const KEY_NAME = 'wallet_key';

export async function generateAndStoreKey(): Promise<string> {
  const bytes = getRandomBytes(32);
  const key = Buffer.from(bytes).toString('hex');
  await SecureStore.setItemAsync(KEY_NAME, key);
  return key;
}

export async function getKeyWithBiometrics(): Promise<string> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to unlock wallet'
  });
  if (!result.success) {
    throw new Error('Authentication failed');
  }
  const key = await SecureStore.getItemAsync(KEY_NAME);
  if (!key) {
    throw new Error('No key found');
  }
  return key;
}

export async function keyExists(): Promise<boolean> {
  const key = await SecureStore.getItemAsync(KEY_NAME);
  return key !== null;
}
