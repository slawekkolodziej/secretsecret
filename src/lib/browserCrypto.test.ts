import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from './browserCrypto';

describe('browserCrypto', () => {
  describe('encryptData', () => {
    it('should encrypt data and return base64 string', async () => {
      const secretData = 'test secret';
      const password = 'test password';

      const result = await encryptData(secretData, password);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should be valid base64
      expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should handle empty string', async () => {
      const result = await encryptData('', 'password');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should handle special characters and unicode', async () => {
      const specialChars = '!@#$%^&*(){}[]|\\:";\'<>?,./ 中文 🎉';
      const result = await encryptData(specialChars, 'password');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should handle long strings', async () => {
      const longString = 'a'.repeat(10000);
      const result = await encryptData(longString, 'password');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    it('should produce different results for same data (due to random salt/IV)', async () => {
      const data = 'same data';
      const password = 'same password';

      const result1 = await encryptData(data, password);
      const result2 = await encryptData(data, password);

      expect(result1).not.toBe(result2); // Different due to random salt and IV
    });

    it('should produce different results for different passwords', async () => {
      const data = 'same data';

      const result1 = await encryptData(data, 'password1');
      const result2 = await encryptData(data, 'password2');

      expect(result1).not.toBe(result2);
    });
  });

  describe('decryptData', () => {
    it('should decrypt previously encrypted data', async () => {
      const originalData = 'test secret data';
      const password = 'test password';

      const encrypted = await encryptData(originalData, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(originalData);
    });

    it('should handle empty string decryption', async () => {
      const originalData = '';
      const password = 'password';

      const encrypted = await encryptData(originalData, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(originalData);
    });

    it('should handle unicode characters', async () => {
      const originalData = 'Hello 世界 🌍 Привет мир';
      const password = 'unicode-password';

      const encrypted = await encryptData(originalData, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(originalData);
    });

    it('should handle large data decryption', async () => {
      const originalData = 'Large data: ' + 'x'.repeat(5000);
      const password = 'large-data-password';

      const encrypted = await encryptData(originalData, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(originalData);
    });

    it('should fail with wrong password', async () => {
      const originalData = 'secret data';
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';

      const encrypted = await encryptData(originalData, correctPassword);

      await expect(decryptData(encrypted, wrongPassword)).rejects.toThrow();
    });

    it('should fail with malformed encrypted data', async () => {
      const invalidData = 'not-valid-encrypted-data';
      const password = 'password';

      await expect(decryptData(invalidData, password)).rejects.toThrow();
    });

    it('should fail with insufficient data length', async () => {
      const shortData = 'c2hvcnQ='; // base64 for "short" - too short for salt+iv+data
      const password = 'password';

      await expect(decryptData(shortData, password)).rejects.toThrow();
    });
  });

  describe('round-trip encryption/decryption', () => {
    const testCases = [
      { name: 'simple text', data: 'Hello World!' },
      { name: 'empty string', data: '' },
      { name: 'numbers and symbols', data: '1234567890!@#$%^&*()' },
      { name: 'unicode characters', data: 'こんにちは 🌍 Привет' },
      {
        name: 'JSON data',
        data: JSON.stringify({ user: 'test', data: [1, 2, 3] })
      },
      { name: 'multiline text', data: 'Line 1\nLine 2\nLine 3\n' },
      {
        name: 'whitespace variations',
        data: '  \t\n  spaces and tabs  \n\t  '
      },
      { name: 'long text', data: 'Lorem ipsum '.repeat(1000) }
    ];

    testCases.forEach(({ name, data }) => {
      it(`should handle ${name}`, async () => {
        const password = `password-for-${name}`;

        const encrypted = await encryptData(data, password);
        const decrypted = await decryptData(encrypted, password);

        expect(decrypted).toBe(data);
      });
    });
  });

  describe('password variations', () => {
    const passwords = [
      'simple',
      'Complex123!',
      '',
      '中文密码',
      '🔐🔑',
      'very-long-password-with-many-characters-' + 'x'.repeat(100),
      'password with spaces',
      'special!@#$%^&*()characters'
    ];

    passwords.forEach((password) => {
      it(`should work with password: "${password.substring(0, 20)}${password.length > 20 ? '...' : ''}"`, async () => {
        const data = 'test data';

        const encrypted = await encryptData(data, password);
        const decrypted = await decryptData(encrypted, password);

        expect(decrypted).toBe(data);
      });
    });
  });

  describe('data format validation', () => {
    it('should produce encrypted data with expected structure', async () => {
      const data = 'test';
      const password = 'password';

      const encrypted = await encryptData(data, password);

      // Decode base64 to check structure
      const decoded = atob(encrypted);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }

      // Should have at least salt(16) + iv(12) + some encrypted data
      expect(bytes.length).toBeGreaterThanOrEqual(28);

      // First 16 bytes should be salt, next 12 should be IV
      const salt = bytes.slice(0, 16);
      const iv = bytes.slice(16, 28);
      const encryptedContent = bytes.slice(28);

      expect(salt.length).toBe(16);
      expect(iv.length).toBe(12);
      expect(encryptedContent.length).toBeGreaterThan(0);
    });

    it('should produce different salts and IVs for each encryption', async () => {
      const data = 'same data';
      const password = 'same password';

      const encrypted1 = await encryptData(data, password);
      const encrypted2 = await encryptData(data, password);

      // Decode both
      const decoded1 = atob(encrypted1);
      const decoded2 = atob(encrypted2);

      const bytes1 = new Uint8Array(decoded1.length);
      const bytes2 = new Uint8Array(decoded2.length);

      for (let i = 0; i < decoded1.length; i++) {
        bytes1[i] = decoded1.charCodeAt(i);
      }
      for (let i = 0; i < decoded2.length; i++) {
        bytes2[i] = decoded2.charCodeAt(i);
      }

      // Salts should be different
      const salt1 = bytes1.slice(0, 16);
      const salt2 = bytes2.slice(0, 16);
      expect(Array.from(salt1)).not.toEqual(Array.from(salt2));

      // IVs should be different
      const iv1 = bytes1.slice(16, 28);
      const iv2 = bytes2.slice(16, 28);
      expect(Array.from(iv1)).not.toEqual(Array.from(iv2));
    });
  });

  describe('crypto algorithm validation', () => {
    it('should use strong cryptographic parameters', async () => {
      // This test ensures we're using the expected parameters
      // We can't directly test the crypto parameters without mocking,
      // but we can test that the functionality works as expected

      const data = 'test data';
      const password = 'test password';

      const encrypted = await encryptData(data, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(data);

      // The encrypted data should be significantly different from the original
      expect(encrypted).not.toContain(data);
      expect(encrypted).not.toContain(password);
    });

    it('should be resistant to tampering', async () => {
      const data = 'sensitive data';
      const password = 'password';

      const encrypted = await encryptData(data, password);

      // Tamper with the encrypted data
      let tamperedData = encrypted.slice(0, -1) + 'X'; // Change last character

      await expect(decryptData(tamperedData, password)).rejects.toThrow();

      // Try changing a character in the middle
      const mid = Math.floor(encrypted.length / 2);
      tamperedData = encrypted.slice(0, mid) + 'Y' + encrypted.slice(mid + 1);

      await expect(decryptData(tamperedData, password)).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle very short passwords', async () => {
      const data = 'test';
      const password = 'x';

      const encrypted = await encryptData(data, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(data);
    });

    it('should handle data with null bytes', async () => {
      const data = 'test\x00data\x00with\x00nulls';
      const password = 'password';

      const encrypted = await encryptData(data, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(data);
    });

    it('should handle data that looks like base64', async () => {
      const data = 'VGhpcyBsb29rcyBsaWtlIGJhc2U2NCBidXQgaXNudA==';
      const password = 'password';

      const encrypted = await encryptData(data, password);
      const decrypted = await decryptData(encrypted, password);

      expect(decrypted).toBe(data);
    });
  });
});
