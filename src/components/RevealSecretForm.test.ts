import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import RevealSecretForm from './RevealSecretForm.svelte';
import { encryptData } from '../lib/browserCrypto';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RevealSecretForm Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockReplaceState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    user = userEvent.setup();
    mockFetch.mockClear();

    // Mock history.replaceState
    mockReplaceState = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { replaceState: mockReplaceState },
      writable: true
    });

    // Reset location hash
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        pathname: '/share/test',
        search: ''
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render and Props', () => {
    it('should render form with expire time and destruct warning', () => {
      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: true,
          expireIn: '2 hours',
          encryptedData: 'encrypted-data'
        }
      });

      expect(screen.getByRole('heading')).toHaveTextContent(
        'This secret expires in 2 hours or after revealing!'
      );
      expect(
        screen.getByRole('button', { name: /reveal secret/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reveal secret/i })
      ).toBeInTheDocument();
    });

    it('should render form without destruct warning when destruct=false', () => {
      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '1 day',
          encryptedData: 'encrypted-data'
        }
      });

      expect(screen.getByRole('heading')).toHaveTextContent(
        'This secret expires in 1 day.'
      );
    });

    it('should show password description text', () => {
      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: true,
          expireIn: '2 hours',
          encryptedData: 'encrypted-data'
        }
      });

      expect(
        screen.getByText(/enter the password that came along with this link/i)
      ).toBeInTheDocument();
    });
  });

  describe('URL Hash Password Handling', () => {
    it('should extract password from URL hash and show different UI', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#mypassword123', pathname: '/share/test', search: '' },
        writable: true
      });

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: true,
          expireIn: '2 hours',
          encryptedData: 'encrypted-data'
        }
      });

      // Should show click-to-decrypt message instead of password input
      expect(
        screen.getByText(/click below to decrypt and view the secret/i)
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();

      // Should clear the hash from URL
      expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/share/test');
    });

    it('should decode URL encoded passwords from hash', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hash: '#my%20password%20with%20spaces',
          pathname: '/share/test',
          search: ''
        },
        writable: true
      });

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: true,
          expireIn: '2 hours',
          encryptedData: 'encrypted-data'
        }
      });

      expect(
        screen.getByText(/click below to decrypt and view the secret/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission and Decryption', () => {
    it('should handle successful decryption of plain text secret', async () => {
      const password = 'test-password';
      const secretText = 'This is my secret message!';
      const encryptedData = await encryptData(secretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      // Wait for decryption and UI update
      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(secretText);
      expect(secretTextArea).toHaveAttribute('readonly');

      // Form should be hidden after successful decryption
      expect(
        screen.queryByRole('button', { name: /reveal secret/i })
      ).not.toBeInTheDocument();

      // Should show "Share something securely too" button
      expect(
        screen.getByRole('button', { name: /share something securely too/i })
      ).toBeInTheDocument();
    });

    it('should handle successful decryption of structured data with files', async () => {
      const password = 'test-password';
      const secretData = {
        text: 'Secret with files',
        files: [
          {
            name: 'document.pdf',
            size: 1024,
            data: 'base64-encoded-data'
          },
          {
            name: 'image.jpg',
            size: 2048,
            data: 'another-base64-data'
          }
        ]
      };
      const encryptedData = await encryptData(
        JSON.stringify(secretData),
        password
      );

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      // Should show the text content
      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(secretData.text);

      // Should show attached files
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
      expect(screen.getByText('(1.0 KB)')).toBeInTheDocument(); // 1024 bytes
      expect(screen.getByText('(2.0 KB)')).toBeInTheDocument(); // 2048 bytes
    });

    it('should handle decryption with only files (no text)', async () => {
      const password = 'test-password';
      const secretData = {
        text: '',
        files: [
          {
            name: 'secret-file.txt',
            size: 512,
            data: 'file-data'
          }
        ]
      };
      const encryptedData = await encryptData(
        JSON.stringify(secretData),
        password
      );

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('secret-file.txt')).toBeInTheDocument();
      });

      // Should not show text area when text is empty
      expect(screen.queryByLabelText(/secret/i)).not.toBeInTheDocument();

      // Should show the file
      expect(screen.getByText('secret-file.txt')).toBeInTheDocument();
      expect(screen.getByText('(512 B)')).toBeInTheDocument();
    });

    it('should handle hash password decryption automatically', async () => {
      const password = 'hash-password';
      const secretText = 'Secret from hash!';
      const encryptedData = await encryptData(secretText, password);

      Object.defineProperty(window, 'location', {
        value: { hash: `#${password}`, pathname: '/share/test', search: '' },
        writable: true
      });

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(secretText);
    });
  });

  describe('Error Handling', () => {
    it('should show error message for wrong password', async () => {
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';
      const secretText = 'This is secret';
      const encryptedData = await encryptData(secretText, correctPassword);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, wrongPassword);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getAllByText(
            /provided password is invalid or data are corrupted/i
          )[0]
        ).toBeInTheDocument();
      });

      // Form should still be visible
      expect(
        screen.getByRole('button', { name: /reveal secret/i })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/secret/i)).not.toBeInTheDocument();
    });

    it('should show error message for corrupted encrypted data', async () => {
      const password = 'test-password';
      const corruptedData = 'definitely-not-valid-encrypted-data';

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData: corruptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getAllByText(
            /provided password is invalid or data are corrupted/i
          )[0]
        ).toBeInTheDocument();
      });
    });

    it('should clear previous errors on new submission', async () => {
      const password = 'test-password';
      const secretText = 'Valid secret';
      const encryptedData = await encryptData(secretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      // First attempt with wrong password
      await user.type(passwordInput, 'wrong-password');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getAllByText(
            /provided password is invalid or data are corrupted/i
          )[0]
        ).toBeInTheDocument();
      });

      // Clear input and try with correct password
      await user.clear(passwordInput);
      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      // Error message should be gone
      expect(
        screen.queryAllByText(
          /provided password is invalid or data are corrupted/i
        )
      ).toHaveLength(0);
    });
  });

  describe('Destructive Behavior', () => {
    it('should make DELETE request after successful decryption when destruct=true', async () => {
      const password = 'test-password';
      const secretText = 'Secret to be deleted';
      const encryptedData = await encryptData(secretText, password);
      const secretId = 'test-secret-id';

      mockFetch.mockResolvedValueOnce({ ok: true });

      render(RevealSecretForm, {
        props: {
          id: secretId,
          destruct: true,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      // Should make DELETE request
      expect(mockFetch).toHaveBeenCalledWith(`/api/secrets/${secretId}`, {
        method: 'delete'
      });
    });

    it('should not make DELETE request when destruct=false', async () => {
      const password = 'test-password';
      const secretText = 'Non-destructive secret';
      const encryptedData = await encryptData(secretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-secret-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      // Should not make any fetch calls
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle DELETE request failure gracefully', async () => {
      const password = 'test-password';
      const secretText = 'Secret with delete error';
      const encryptedData = await encryptData(secretText, password);

      // Mock console.error to check it's called
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(RevealSecretForm, {
        props: {
          id: 'test-secret-id',
          destruct: true,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      // Should still show the secret despite delete failure
      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(secretText);

      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Could not delete test-secret-id',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('User Interactions', () => {
    it('should select all text when clicking on revealed secret', async () => {
      const password = 'test-password';
      const secretText = 'Clickable secret text';
      const encryptedData = await encryptData(secretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;

      // Mock the select method
      const selectSpy = vi
        .spyOn(secretTextArea, 'select')
        .mockImplementation(() => {});

      await fireEvent.click(secretTextArea);

      expect(selectSpy).toHaveBeenCalled();
      selectSpy.mockRestore();
    });

    it('should handle keyboard submission', async () => {
      const password = 'keyboard-password';
      const secretText = 'Submitted via keyboard';
      const encryptedData = await encryptData(secretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(passwordInput, password);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(secretText);
    });

    it('should show create another button after successful reveal', async () => {
      const password = 'test-password';
      const secretText = 'Test secret';
      const encryptedData = await encryptData(secretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /share something securely too/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Legacy Data Format Support', () => {
    it('should handle legacy plain text format', async () => {
      const password = 'legacy-password';
      const legacySecretText = 'This is a legacy format secret';

      // Directly encrypt the text without JSON structure
      const encryptedData = await encryptData(legacySecretText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(legacySecretText);

      // Should not show file attachments for legacy format
      expect(screen.queryByText(/attached files/i)).not.toBeInTheDocument();
    });

    it('should handle invalid JSON that falls back to legacy format', async () => {
      const password = 'test-password';
      const invalidJsonText = '{"invalid": json, missing quote}';
      const encryptedData = await encryptData(invalidJsonText, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(invalidJsonText);
    });

    it('should handle JSON that doesnt match SecretData interface', async () => {
      const password = 'test-password';
      const nonSecretJson = JSON.stringify({
        someOtherField: 'value',
        number: 123
      });
      const encryptedData = await encryptData(nonSecretJson, password);

      render(RevealSecretForm, {
        props: {
          id: 'test-id',
          destruct: false,
          expireIn: '2 hours',
          encryptedData
        }
      });

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', {
        name: /reveal secret/i
      });

      await user.type(passwordInput, password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/secret/i)).toBeInTheDocument();
      });

      const secretTextArea = screen.getByLabelText(
        /secret/i
      ) as HTMLTextAreaElement;
      expect(secretTextArea.value).toBe(nonSecretJson);
    });
  });
});
