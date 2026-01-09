/* eslint-disable no-console */
import { writeFileSync } from 'fs';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Immersion API',
    version: '0.1.0',
    description: 'Generated baseline OpenAPI specification',
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                  },
                  required: ['status'],
                },
              },
            },
          },
        },
      },
    },
  },
};

writeFileSync('openapi.json', JSON.stringify(spec, null, 2));
console.log('openapi.json generated');
