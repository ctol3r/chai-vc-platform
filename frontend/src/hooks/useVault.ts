import { useCallback } from "react";
import { encryptData, decryptData } from "../../vault/client_vault";

const PREFIX = "chai-vault:";
const FALLBACK_PASSWORD = process.env.NEXT_PUBLIC_VAULT_PASSWORD ?? "demo-password";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const hasSubtleCrypto = () => {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return true;
  }

  if (typeof window !== "undefined") {
    const anyWindow = window as typeof window & {
      msCrypto?: Crypto & { subtle?: SubtleCrypto };
    };

    return Boolean(anyWindow.crypto?.subtle || anyWindow.msCrypto?.subtle);
  }

  return false;
};

const ensureWebCrypto = async () => {
  if (hasSubtleCrypto()) {
    return true;
  }

  if (typeof window !== "undefined") {
    const anyWindow = window as typeof window & {
      msCrypto?: Crypto & { subtle?: SubtleCrypto };
    };

    if (!anyWindow.crypto && anyWindow.msCrypto) {
      (globalThis as typeof globalThis & { crypto?: Crypto }).crypto =
        anyWindow.msCrypto as unknown as Crypto;
    }
  } else if (
    typeof globalThis !== "undefined" &&
    typeof (globalThis as typeof globalThis & { msCrypto?: Crypto }).msCrypto !== "undefined"
  ) {
    const { msCrypto } = globalThis as typeof globalThis & { msCrypto?: Crypto };
    if (msCrypto && !(globalThis as typeof globalThis & { crypto?: Crypto }).crypto) {
      (globalThis as typeof globalThis & { crypto?: Crypto }).crypto =
        msCrypto as unknown as Crypto;
    }
  }

  if (hasSubtleCrypto()) {
    return true;
  }

  if (
    typeof window === "undefined" &&
    typeof process !== "undefined" &&
    process.versions?.node
  ) {
    try {
      const nodeCrypto = await import("crypto");
      const webcrypto = nodeCrypto.webcrypto as Crypto | undefined;
      if (webcrypto) {
        (globalThis as typeof globalThis & { crypto?: Crypto }).crypto = webcrypto;
      }
    } catch (error) {
      console.warn("WebCrypto fallback initialization failed", error);
    }
  }

  return hasSubtleCrypto();
};

export interface VaultHandle {
  get: () => Promise<string | null>;
  set: (value: string) => Promise<void>;
  clear: () => void;
  available: boolean;
}

/**
 * Lightweight vault helper that encrypts values before storing them locally.
 * TODO: replace demo password with per-user secrets derived from WebAuthn once available.
 */
export default function useVault(
  key: string,
  password: string = FALLBACK_PASSWORD
): VaultHandle {
  const storageKey = `${PREFIX}${key}`;

  const get = useCallback(async () => {
    if (!canUseStorage()) {
      return null;
    }

    if (!(await ensureWebCrypto())) {
      console.warn("WebCrypto unavailable; cannot read vault payload");
      return null;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    try {
      return await decryptData(raw, password);
    } catch (error) {
      console.warn("Vault decrypt failed", error);
      return null;
    }
  }, [storageKey, password]);

  const set = useCallback(
    async (value: string) => {
      if (!canUseStorage()) {
        return;
      }

      if (!(await ensureWebCrypto())) {
        console.warn("WebCrypto unavailable; skipping vault write");
        return;
      }

      try {
        const encrypted = await encryptData(value, password);
        window.localStorage.setItem(storageKey, encrypted);
      } catch (error) {
        console.warn("Vault encrypt failed", error);
      }
    },
    [storageKey, password]
  );

  const clear = useCallback(() => {
    if (!canUseStorage()) {
      return;
    }
    window.localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    get,
    set,
    clear,
    available: canUseStorage() && hasSubtleCrypto(),
  };
}
