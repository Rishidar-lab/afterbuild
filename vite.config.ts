import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure-function tests over the parser/detector/brief builder — node is
    // fine and fast. Individual integration tests opt into jsdom per-file
    // via a `// @vitest-environment jsdom` pragma (see tests/integration.render.test.ts).
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
