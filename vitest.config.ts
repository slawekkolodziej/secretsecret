import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      hot: !process.env.VITEST
    })
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'dist/',
        '.astro/',
        'public/',
        '**/*.astro' // Astro files are harder to test directly
      ],
      include: [
        'src/lib/**/*.{js,ts}',
        'src/components/**/*.svelte',
        'src/pages/api/**/*.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      $lib: new URL('./src/lib', import.meta.url).pathname
    },
    conditions: ['browser']
  },
  // Ensure Svelte is processed for client-side testing
  ssr: {
    noExternal: ['@testing-library/svelte']
  },
  define: {
    global: 'globalThis'
  }
});
