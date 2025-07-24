import crypto from 'crypto';

export function issueCredential(payload, secret) {
  const message = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');
  return { payload, signature };
}

export function validateCredential(credential, secret) {
  const { payload, signature } = credential;
  const message = JSON.stringify(payload);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');
  return signature === expected;
}
