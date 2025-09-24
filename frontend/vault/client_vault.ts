export async function encryptData(data: string, password: string): Promise<string> {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: iv, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    );
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(data)
    );
    const result = new Uint8Array(iv.length + cipherBuffer.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(cipherBuffer), iv.length);

    // Convert Uint8Array -> base64 safely (no spread on typed arrays)
    const u8 = result;
    const CHUNK = 0x8000; // chunking avoids call-arg limits
    let str = '';
    for (let i = 0; i < u8.length; i += CHUNK) {
        const slice = u8.subarray(i, Math.min(i + CHUNK, u8.length));
        // Array.from(slice) converts to a plain number[] which String.fromCharCode accepts
        str += String.fromCharCode.apply(null, Array.from(slice));
    }
    return btoa(str);
}

export async function decryptData(payload: string, password: string): Promise<string> {
    const enc = new TextEncoder();
    const data = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: iv, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );
    const plainBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
    );
    return new TextDecoder().decode(plainBuffer);
}
