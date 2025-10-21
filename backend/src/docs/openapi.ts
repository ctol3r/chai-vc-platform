import { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'VitalCV Pilot P0 API',
    version: '1.0.0',
    description: 'Minimal REST backend for credential issuance, verification, and revocation',
    contact: {
      name: 'VitalCV Platform',
      email: 'support@vitalcv.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Check if the service is running',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    service: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/issuer/credential': {
      post: {
        summary: 'Issue Credential',
        description: 'Issue a new verifiable credential',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subject'],
                properties: {
                  subject: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string', description: 'Subject identifier' },
                      name: { type: 'string', description: 'Subject name' },
                      licenseNumber: { type: 'string', description: 'License number' },
                      licenseState: { type: 'string', description: 'License state' }
                    }
                  },
                  validity: {
                    type: 'object',
                    properties: {
                      from: { type: 'string', format: 'date-time' },
                      until: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Credential issued successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    credentialId: { type: 'string' },
                    jwt: { type: 'string' },
                    auditRef: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'array', items: { type: 'object' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/verifier/presentation': {
      post: {
        summary: 'Verify Credential',
        description: 'Verify a credential presentation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['jwt'],
                properties: {
                  jwt: { type: 'string', description: 'JWT credential to verify' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Verification result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean' },
                    reason: { type: 'string' },
                    auditRef: { type: 'string' },
                    credentialId: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'array', items: { type: 'object' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/issuer/revoke': {
      post: {
        summary: 'Revoke Credential',
        description: 'Revoke a credential',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['credentialId'],
                properties: {
                  credentialId: { type: 'string', description: 'Credential ID to revoke' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Credential revoked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    credentialId: { type: 'string' },
                    auditRef: { type: 'string' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Credential not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    details: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'string' }
        }
      }
    }
  }
};