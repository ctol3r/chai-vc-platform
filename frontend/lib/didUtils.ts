export interface DIDDocument {
  id: string;
  publicKey: Array<{
    id: string;
    type: string;
    publicKeyJwk: JsonWebKey;
  }>;
}

/**
 * Generates a simple DID Document using a newly created ECDSA key pair.
 * The private key is stored in IndexedDB under the `did-keys` database.
 */
export async function generateDIDDocument(): Promise<DIDDocument> {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const did = `did:example:${publicKeyJwk.x}${publicKeyJwk.y}`;

  await storePrivateKey(did, keyPair.privateKey);

  return {
    id: did,
    publicKey: [
      {
        id: `${did}#keys-1`,
        type: 'JsonWebKey2020',
        publicKeyJwk,
      },
    ],
  };
}

/** Store private key JWK in IndexedDB */
async function storePrivateKey(did: string, key: CryptoKey): Promise<void> {
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', key);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('did-keys', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'id' });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readwrite');
      const store = tx.objectStore('keys');
      store.put({ id: did, privateKeyJwk });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

/** Retrieve stored private key from IndexedDB */
export async function loadPrivateKey(did: string): Promise<CryptoKey | null> {
  const privateKeyJwk = await getPrivateKeyJwk(did);
  if (!privateKeyJwk) return null;
  return window.crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  );
}

function getPrivateKeyJwk(did: string): Promise<JsonWebKey | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('did-keys', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readonly');
      const store = tx.objectStore('keys');
      const getReq = store.get(did);
      getReq.onsuccess = () => resolve(getReq.result ? getReq.result.privateKeyJwk : null);
      getReq.onerror = () => reject(getReq.error);
    };
  });
}
