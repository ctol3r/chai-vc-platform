import crypto from 'crypto';
import type { Request, Response } from 'express';
import { createPreAuthorizedCode, issuerMetadata, nonceResponse, redeemPreAuthorizedCode } from '../src/controllers/oidc4vci_controller';
import { redisHealth } from '../src/controllers/health_controller';
import { preAuthorizedCodeService } from '../src/services/preAuthorizedCodeService';
import { validationResult } from 'express-validator';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const validationResultMock = validationResult as unknown as jest.Mock;

type MockResponse = Response & { body?: any; headers: Record<string, string>; statusCode: number };

function createMockResponse(): MockResponse {
  const headers: Record<string, string> = {};
  const res: Partial<MockResponse> & { body?: any } = {
    statusCode: 200,
    headers,
  };
  res.status = ((code: number) => {
    res.statusCode = code;
    return res as MockResponse;
  }) as MockResponse['status'];
  res.json = ((payload: any) => {
    res.body = payload;
    return res as MockResponse;
  }) as MockResponse['json'];
  res.set = ((field: string, value: string) => {
    headers[field.toLowerCase()] = value;
    return res as MockResponse;
  }) as MockResponse['set'];
  res.end = (() => {
    res.body = undefined;
    return res as MockResponse;
  }) as MockResponse['end'];
  return res as MockResponse;
}

function createMockRequest(body: Record<string, unknown>): Request {
  return { body } as Request;
}

function challengeFromVerifier(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

describe('OIDC4VCI controller', () => {
  beforeEach(async () => {
    validationResultMock.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
    await preAuthorizedCodeService.clear();
  });

  it('returns issuer metadata', () => {
    const res = createMockResponse();
    issuerMetadata({} as Request, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.credential_issuer).toBeDefined();
    expect(res.body.nonce_endpoint).toContain('/oidc4vci/nonce');
    const grantKey = 'urn:ietf:params:oauth:grant-type:pre-authorized_code';
    expect(res.body.grants).toBeDefined();
    expect(res.body.grants[grantKey]).toBeDefined();
    expect(res.body.grants[grantKey]['pre-authorized_code']).toBeDefined();
    expect(res.body.grants[grantKey]['pre-authorized_code'].tx_code.required).toBe(false);
  });

  it('validates request payloads on issue', async () => {
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => false,
      array: () => [{ msg: 'client_id required' }],
    });
    const res = createMockResponse();
    await createPreAuthorizedCode(createMockRequest({}), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('client_id required');
  });

  it('issues and redeems a pre-authorized code with nonce binding', async () => {
    const verifier = 'controller-verifier';
    const res = createMockResponse();
    await createPreAuthorizedCode(
      createMockRequest({
        client_id: 'wallet',
        wallet_nonce: 'nonce-1',
        code_challenge: challengeFromVerifier(verifier),
        code_challenge_method: 'S256',
      }),
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.tx_code_required).toBe(false);
    const code = res.body.pre_authorized_code as string;

    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });
    const redeemRes = createMockResponse();
    await redeemPreAuthorizedCode(
      createMockRequest({
        pre_authorized_code: code,
        wallet_nonce: 'nonce-1',
        code_verifier: verifier,
        grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
      }),
      redeemRes
    );
    expect(redeemRes.statusCode).toBe(200);
    expect(typeof redeemRes.body.access_token).toBe('string');
    expect(redeemRes.body.access_token.length).toBeGreaterThan(10);
    expect(typeof redeemRes.body.c_nonce).toBe('string');
    expect(redeemRes.body.token_type).toBe('bearer');
  });

  it('rejects nonce mismatches on redemption', async () => {
    const verifier = 'controller-nonce-mismatch';
    const issueRes = createMockResponse();
    await createPreAuthorizedCode(
      createMockRequest({
        client_id: 'wallet',
        wallet_nonce: 'nonce-2',
        code_challenge: challengeFromVerifier(verifier),
        code_challenge_method: 'S256',
      }),
      issueRes
    );
    const code = issueRes.body.pre_authorized_code as string;
    validationResultMock.mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    });
    const redeemRes = createMockResponse();
    await redeemPreAuthorizedCode(
      createMockRequest({
        pre_authorized_code: code,
        wallet_nonce: 'nonce-2-mismatch',
        code_verifier: verifier,
        grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
      }),
      redeemRes
    );
    expect(redeemRes.statusCode).toBe(400);
    expect(redeemRes.body.error).toBe('nonce_mismatch');
  });

  it('rejects unsupported challenge methods', async () => {
    const res = createMockResponse();
    await createPreAuthorizedCode(
      createMockRequest({
        client_id: 'wallet',
        wallet_nonce: 'nonce',
        code_challenge: 'ignored',
        code_challenge_method: 'plain',
      }),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('unsupported_code_challenge_method');
  });

  it('issues fresh nonces via the nonce endpoint', async () => {
    const first = createMockResponse();
    await nonceResponse({} as Request, first);
    const second = createMockResponse();
    await nonceResponse({} as Request, second);
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.headers['cache-control']).toBe('no-store');
    expect(first.body.c_nonce).not.toBe(second.body.c_nonce);
  });

  it('includes tx_code metadata when enabled', () => {
    const txCodeSpy = jest.spyOn(preAuthorizedCodeService, 'isTxCodeRequiredByDefault').mockReturnValue(true);
    const lengthSpy = jest.spyOn(preAuthorizedCodeService, 'getTxCodeLength').mockReturnValue(6);
    try {
      const res = createMockResponse();
      issuerMetadata({} as Request, res);
      const grantKey = 'urn:ietf:params:oauth:grant-type:pre-authorized_code';
      expect(res.body.grants[grantKey]['pre-authorized_code'].tx_code).toEqual(
        expect.objectContaining({ required: true, length: 6 })
      );
    } finally {
      txCodeSpy.mockRestore();
      lengthSpy.mockRestore();
    }
  });
});

describe('Redis health probe', () => {
  it('returns 204 when redis feature disabled', async () => {
    const res = createMockResponse();
    const spy = jest.spyOn(preAuthorizedCodeService, 'isRedisBacked').mockReturnValue(false);
    try {
      await redisHealth({} as Request, res);
      expect(res.statusCode).toBe(204);
      expect(res.body).toBeUndefined();
    } finally {
      spy.mockRestore();
    }
  });

  it('returns 200 when redis is healthy', async () => {
    const res = createMockResponse();
    const backed = jest.spyOn(preAuthorizedCodeService, 'isRedisBacked').mockReturnValue(true);
    const health = jest.spyOn(preAuthorizedCodeService, 'checkRedisHealth').mockResolvedValue(true);
    try {
      await redisHealth({} as Request, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    } finally {
      backed.mockRestore();
      health.mockRestore();
    }
  });

  it('returns 503 when redis ping fails', async () => {
    const res = createMockResponse();
    const backed = jest.spyOn(preAuthorizedCodeService, 'isRedisBacked').mockReturnValue(true);
    const health = jest.spyOn(preAuthorizedCodeService, 'checkRedisHealth').mockRejectedValue(new Error('down'));
    try {
      await redisHealth({} as Request, res);
      expect(res.statusCode).toBe(503);
      expect(res.body.status).toBe('unhealthy');
    } finally {
      backed.mockRestore();
      health.mockRestore();
    }
  });
});
