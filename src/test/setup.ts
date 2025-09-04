import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    KV_REST_API_URL: 'http://localhost:8080',
    KV_REST_API_TOKEN: 'test-token',
    DEV: true,
    MODE: 'test'
  }
});

// Use Node.js webcrypto which is compatible with browser crypto
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  writable: true
});

// Mock window.crypto for browser compatibility
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    writable: true
  });
}

// Ensure we're in browser/DOM mode for Svelte
if (typeof window !== 'undefined') {
  // Ensure window object exists and has proper properties
  Object.defineProperty(window, 'process', {
    value: {
      browser: true,
      env: { NODE_ENV: 'test' }
    },
    writable: true
  });
}
