import {
  generateKeyPair,
  sign,
  verify,
  createJWS,
  verifyJWS,
} from '../src/lib/ed25519';

describe('Ed25519 Signing', () => {
  describe('generateKeyPair', () => {
    it('should generate a valid Ed25519 keypair', async () => {
      const keyPair = await generateKeyPair();

      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKeyHex).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(keyPair.publicKeyHex).toHaveLength(64);
    });

    it('should generate unique keypairs', async () => {
      const kp1 = await generateKeyPair();
      const kp2 = await generateKeyPair();

      expect(kp1.privateKeyHex).not.toBe(kp2.privateKeyHex);
      expect(kp1.publicKeyHex).not.toBe(kp2.publicKeyHex);
    });
  });

  describe('sign and verify', () => {
    it('should sign and verify a message', async () => {
      const keyPair = await generateKeyPair();
      const message = 'Hello, VitalCV!';

      const signature = await sign(message, keyPair.privateKeyHex);
      const isValid = await verify(message, signature, keyPair.publicKeyHex);

      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong public key', async () => {
      const kp1 = await generateKeyPair();
      const kp2 = await generateKeyPair();
      const message = 'Hello, VitalCV!';

      const signature = await sign(message, kp1.privateKeyHex);
      const isValid = await verify(message, signature, kp2.publicKeyHex);

      expect(isValid).toBe(false);
    });

    it('should fail verification with tampered message', async () => {
      const keyPair = await generateKeyPair();
      const message = 'Hello, VitalCV!';

      const signature = await sign(message, keyPair.privateKeyHex);
      const isValid = await verify(
        'Tampered message',
        signature,
        keyPair.publicKeyHex
      );

      expect(isValid).toBe(false);
    });

    it('should handle binary data', async () => {
      const keyPair = await generateKeyPair();
      const data = Buffer.from('binary data 🔐');

      const signature = await sign(data, keyPair.privateKeyHex);
      const isValid = await verify(data, signature, keyPair.publicKeyHex);

      expect(isValid).toBe(true);
    });
  });

  describe('createJWS and verifyJWS', () => {
    it('should create and verify a JWS', async () => {
      const keyPair = await generateKeyPair();
      const payload = {
        iss: 'https://vitalcv.com',
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const jws = await createJWS(payload, keyPair.privateKeyHex);
      const result = await verifyJWS(jws, keyPair.publicKeyHex);

      expect(result.valid).toBe(true);
      expect(result.payload).toMatchObject(payload);
    });

    it('should detect invalid JWS format', async () => {
      const keyPair = await generateKeyPair();
      const invalidJWS = 'invalid.jws';

      const result = await verifyJWS(invalidJWS, keyPair.publicKeyHex);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid JWS format');
    });

    it('should reject wrong algorithm', async () => {
      // Create JWS with wrong algorithm
      const header = { alg: 'RS256', typ: 'JWT' };
      const payload = { test: 'data' };
      
      const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
      const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const fakeJWS = `${headerBase64}.${payloadBase64}.fakesignature`;

      const keyPair = await generateKeyPair();
      const result = await verifyJWS(fakeJWS, keyPair.publicKeyHex);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported algorithm');
    });

    it('should fail verification with tampered payload', async () => {
      const keyPair = await generateKeyPair();
      const payload = { data: 'original' };

      const jws = await createJWS(payload, keyPair.privateKeyHex);
      const parts = jws.split('.');

      // Tamper with payload
      const tamperedPayload = Buffer.from(
        JSON.stringify({ data: 'tampered' })
      ).toString('base64url');
      const tamperedJWS = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const result = await verifyJWS(tamperedJWS, keyPair.publicKeyHex);

      expect(result.valid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', async () => {
      const keyPair = await generateKeyPair();
      const message = '';

      const signature = await sign(message, keyPair.privateKeyHex);
      const isValid = await verify(message, signature, keyPair.publicKeyHex);

      expect(isValid).toBe(true);
    });

    it('should handle very long messages', async () => {
      const keyPair = await generateKeyPair();
      const message = 'A'.repeat(10000);

      const signature = await sign(message, keyPair.privateKeyHex);
      const isValid = await verify(message, signature, keyPair.publicKeyHex);

      expect(isValid).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const keyPair = await generateKeyPair();
      const message = 'Hello 世界 🌍 Здравствуй';

      const signature = await sign(message, keyPair.privateKeyHex);
      const isValid = await verify(message, signature, keyPair.publicKeyHex);

      expect(isValid).toBe(true);
    });

    it('should fail gracefully with invalid keys', async () => {
      const keyPair = await generateKeyPair();
      const message = 'test';

      const signature = await sign(message, keyPair.privateKeyHex);
      const isValid = await verify(message, signature, 'invalid-hex-key');

      expect(isValid).toBe(false);
    });
  });

  describe('Regression Tests', () => {
    it('should consistently verify known good signature', async () => {
      // Fixed test vector
      const privateKeyHex =
        '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
      const publicKeyHex =
        'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
      const message = 'test message';

      const signature = await sign(message, privateKeyHex);
      const isValid = await verify(message, signature, publicKeyHex);

      expect(isValid).toBe(true);

      // Verify signature is deterministic
      const signature2 = await sign(message, privateKeyHex);
      expect(signature).toBe(signature2);
    });

    it('should reject signature with wrong public key', async () => {
      const kp1 = await generateKeyPair();
      const kp2 = await generateKeyPair();
      const message = 'test';

      const signature = await sign(message, kp1.privateKeyHex);
      const isValid = await verify(message, signature, kp2.publicKeyHex);

      expect(isValid).toBe(false);
    });

    it('should handle concurrent signing operations', async () => {
      const keyPair = await generateKeyPair();
      const messages = Array.from({ length: 100 }, (_, i) => `message-${i}`);

      const signatures = await Promise.all(
        messages.map((msg) => sign(msg, keyPair.privateKeyHex))
      );

      const results = await Promise.all(
        messages.map((msg, i) =>
          verify(msg, signatures[i], keyPair.publicKeyHex)
        )
      );

      expect(results.every((r) => r === true)).toBe(true);
    });
  });
});
