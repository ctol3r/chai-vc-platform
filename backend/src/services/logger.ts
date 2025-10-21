import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.jwt',
      'subject.id',
      'subjectId',
      'credentialId',
      '*.password',
      '*.jwt',
      '*.token'
    ],
    censor: '[REDACTED]'
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});