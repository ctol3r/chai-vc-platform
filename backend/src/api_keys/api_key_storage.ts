import { promises as fs } from 'fs';
import { APIKey } from './api_key_model';

const DB_FILE = __dirname + '/../../api_keys.json';

async function readDB(): Promise<APIKey[]> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function writeDB(keys: APIKey[]) {
  await fs.writeFile(DB_FILE, JSON.stringify(keys, null, 2));
}

export async function getAllKeys(): Promise<APIKey[]> {
  return readDB();
}

export async function saveKey(key: APIKey) {
  const keys = await readDB();
  keys.push(key);
  await writeDB(keys);
}

export async function updateKey(key: APIKey) {
  const keys = await readDB();
  const idx = keys.findIndex(k => k.id === key.id);
  if (idx !== -1) {
    keys[idx] = key;
    await writeDB(keys);
  }
}

export async function deleteKey(id: string) {
  let keys = await readDB();
  keys = keys.filter(k => k.id !== id);
  await writeDB(keys);
}
