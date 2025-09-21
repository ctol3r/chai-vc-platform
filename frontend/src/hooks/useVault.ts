import { useCallback } from "react";
import { Buffer } from "buffer";

const DEFAULT_SECRET = process.env.NEXT_PUBLIC_VAULT_SECRET || "demo-secret";

const hasSubtleCrypto = typeof globalThis !== "undefined" && !!globalThis.crypto?.subtle;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes: ArrayBuffer | Uint8Array) => {
  const view = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(view).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < view.byteLength; i += 1) {
    binary += String.fromCharCode(view[i]);
  }
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

async function getKey(secret: string) {
  if (!hasSubtleCrypto) {
    return null;
  }
  const raw = encoder.encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export function useVault(secret: string = DEFAULT_SECRET) {
  const encrypt = useCallback(async (payload: unknown) => {
    if (!hasSubtleCrypto) {
      const plain = typeof payload === "string" ? payload : JSON.stringify(payload);
      return { ciphertext: toBase64(encoder.encode(plain)), iv: "" };
    }

    const key = await getKey(secret);
    if (!key) {
      const plain = typeof payload === "string" ? payload : JSON.stringify(payload);
      return { ciphertext: toBase64(encoder.encode(plain)), iv: "" };
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = encoder.encode(JSON.stringify(payload));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    return {
      ciphertext: toBase64(encrypted),
      iv: toBase64(iv),
    };
  }, [secret]);

  const decrypt = useCallback(async (ciphertext: string, iv: string) => {
    if (!hasSubtleCrypto) {
      return JSON.parse(decoder.decode(fromBase64(ciphertext)));
    }
    const key = await getKey(secret);
    if (!key) {
      return JSON.parse(decoder.decode(fromBase64(ciphertext)));
    }

    const decodedCipher = fromBase64(ciphertext);
    const decodedIv = fromBase64(iv);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodedIv }, key, decodedCipher);
    return JSON.parse(decoder.decode(new Uint8Array(decrypted)));
  }, [secret]);

  return { encrypt, decrypt };
}
