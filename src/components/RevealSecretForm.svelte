<script lang="ts">
  import { decryptData } from '../lib/browserCrypto';
  import Button from './Button.svelte';
  import Input from './Input.svelte';
  import TextArea from './TextArea.svelte';
  import AttachedFiles from './AttachedFiles.svelte';
  import type { SecretData } from '../lib/schema';
  import CreateAnotherButton from './CreateAnotherButton.svelte';

  export let id = '';
  export let destruct = true;
  export let expireIn = '';
  export let encryptedData = '';

  let secret = '';
  let secretData: SecretData | null = null;
  let passphrase = '';
  let errors: Record<string, string> = {};
  let hasHashPassword = false;
  let isRevealed = false;

  if (typeof window === 'object') {
    const hashPassword = decodeURIComponent(window.location.hash.slice(1));
    if (hashPassword) {
      passphrase = hashPassword;
      hasHashPassword = true;
    }

    // Clear password from URL hash for security
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }

  async function handleDecrypt() {
    errors = {};

    try {
      secret = await decryptData(encryptedData, passphrase);

      // Try to parse as new JSON format, fallback to plain text
      try {
        const parsed = JSON.parse(secret) as SecretData;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'text' in parsed &&
          'files' in parsed
        ) {
          secretData = parsed;
        } else {
          // Legacy format - just text
          secretData = { text: secret, files: [] };
        }
      } catch {
        // Legacy format - just text
        secretData = { text: secret, files: [] };
      }

      isRevealed = true;
    } catch (_err) {
      errors = {
        passphrase: 'Provided password is invalid or data are corrupted.'
      };
    }

    if (destruct && isRevealed) {
      try {
        await fetch(`/api/secrets/${id}`, {
          method: 'delete'
        });
      } catch (err) {
        console.error(`Could not delete ${id}`, err);
      }
    }
  }

  function handleSecretClick(e: any) {
    e.currentTarget.select();
  }

  const headingSuffix = destruct
    ? ' or <span class="underline">after revealing</span>!'
    : '.';
  const heading = `This secret expires in ${expireIn}${headingSuffix}`;
</script>

<div class="space-y-4">
  <h1 class="text-primary-800 text-xl text-center">
    {@html heading}
  </h1>

  {#if secretData}
    <div class="space-y-8">
      {#if secretData.text}
        <TextArea
          label="Secret:"
          id="secret"
          textAreaClass="h-32"
          readOnly
          value={secretData.text}
          onClick={handleSecretClick}
        />
      {/if}

      {#if secretData.files.length > 0}
        <AttachedFiles files={secretData.files} enableDownloads />
      {/if}

      <CreateAnotherButton label="Share something securely too" />
    </div>
  {:else}
    <form on:submit|preventDefault={handleDecrypt} class="space-y-8">
      {#if hasHashPassword}
        <p class="my-8 text-center">
          Click below to decrypt and view the secret.
        </p>
      {:else}
        <Input
          id="passphrase"
          label="Password:"
          autocomplete="off"
          class="space-y-2"
          error={errors.passphrase}
          bind:value={passphrase}
        >
          <div slot="description">
            <span>
              Enter the password that came along with this link. If you didn't
              receive one, reach out to whoever shared it with you.
            </span>
          </div>
        </Input>
      {/if}

      {#if errors.passphrase}
        <div class="mt-4 text-destructive-600 text-sm">{errors.passphrase}</div>
      {/if}

      <div class="flex items-center justify-center">
        <Button type="submit">Reveal Secret</Button>
      </div>
    </form>
  {/if}
</div>
