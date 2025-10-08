import { Router } from 'express';
import { body } from 'express-validator';
import { createPreAuthorizedCode, issuerMetadata, redeemPreAuthorizedCode } from '../controllers/oidc4vci_controller';

const router = Router();

router.get('/.well-known/openid-credential-issuer', issuerMetadata);

router.post(
  '/oidc4vci/pre-authorized-code',
  body('client_id').isString().withMessage('client_id required'),
  body('wallet_nonce').isString().withMessage('wallet_nonce required'),
  createPreAuthorizedCode
);

router.post(
  '/oidc4vci/token',
  body('pre_authorized_code').isString().withMessage('pre_authorized_code required'),
  body('wallet_nonce').isString().withMessage('wallet_nonce required'),
  redeemPreAuthorizedCode
);

export default router;
