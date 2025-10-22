import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/pilot_routes.test.ts'],
    setupFiles: [],
  },
  define: {
    global: 'globalThis',
  },
});