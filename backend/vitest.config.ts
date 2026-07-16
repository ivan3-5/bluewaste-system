import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/__mocks__/prisma.ts'],
    clearMocks: true,
  },
});
