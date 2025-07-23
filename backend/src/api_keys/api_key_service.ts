import { v4 as uuidv4 } from 'uuid';
import { APIKey } from './api_key_model';
import { getAllKeys, saveKey, updateKey, deleteKey as deleteKeyFromDB } from './api_key_storage';

export async function listKeys(): Promise<APIKey[]> {
  return getAllKeys();
}

export async function createKey(scopes: string[]): Promise<APIKey> {
  const now = new Date().toISOString();
  const key: APIKey = {
    id: uuidv4(),
    token: uuidv4(),
    scopes,
    createdAt: now,
    updatedAt: now,
  };
  await saveKey(key);
  return key;
}

export async function rotateKey(id: string): Promise<APIKey | null> {
  const keys = await getAllKeys();
  const key = keys.find(k => k.id === id);
  if (!key) return null;
  key.token = uuidv4();
  key.updatedAt = new Date().toISOString();
  await updateKey(key);
  return key;
}

export async function deleteKey(id: string) {
  await deleteKeyFromDB(id);
}
