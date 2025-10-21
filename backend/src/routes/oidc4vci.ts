import { Router } from 'express';
import { body } from 'express-validator';
import { createPreAuthorizedCode, issuerMetadata, nonceResponse, redeemPreAuthorizedCode } from '../controllers/oidc4vci_controller';

const router = Router();

router.get('/.well-known/openid-credential-issuer', issuerMetadata);
router.get('/oidc4vci/nonce', nonceResponse);

router.post(
  '/oidc4vci/pre-authorized-code',
  body('client_id').isString().withMessage('client_id required'),
  body('wallet_nonce').isString().withMessage('wallet_nonce required'),
  body('code_challenge').isString().withMessage('code_challenge required'),
  body('code_challenge_method')
    .optional()
    .equals('S256')
    .withMessage('code_challenge_method must be S256'),
  createPreAuthorizedCode
);

router.post(
  '/oidc4vci/token',
  body('pre_authorized_code').isString().withMessage('pre_authorized_code required'),
  body('wallet_nonce').isString().withMessage('wallet_nonce required'),
  body('code_verifier').isString().withMessage('code_verifier required'),
  body('grant_type')
    .isString()
    .withMessage('grant_type required')
    .isIn(['urn:ietf:params:oauth:grant-type:pre-authorized_code'])
    .withMessage('grant_type must be pre-authorized_code'),
  body('tx_code').optional().isString().withMessage('tx_code must be a string'),
  redeemPreAuthorizedCode
);

export default router;
