import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../services/logger';

// Validation schemas
export const issueCredentialSchema = z.object({
  subject: z.object({
    id: z.string().min(1, 'Subject ID is required'),
    name: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseState: z.string().optional()
  }),
  validity: z.object({
    from: z.string().optional(),
    until: z.string().optional()
  }).optional()
});

export const verifyPresentationSchema = z.object({
  jwt: z.string().min(1, 'JWT is required')
});

export const revokeCredentialSchema = z.object({
  credentialId: z.string().min(1, 'Credential ID is required')
});

export const npiParamSchema = z.object({
  npi: z.string().regex(/^\d{10}$/, 'NPI must be exactly 10 digits')
});

export const practitionerParamSchema = z.object({
  id: z.string().min(1, 'Practitioner ID is required')
});

// Validation middleware factory
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({
          errors: error.issues,
          body: req.body,
          url: req.url
        }, 'Validation error');
        
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({
          errors: error.issues,
          params: req.params,
          url: req.url
        }, 'Parameter validation error');
        
        res.status(400).json({
          error: 'Invalid parameters',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}