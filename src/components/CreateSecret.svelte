<script lang="ts">
  import { encryptData } from '../lib/browserCrypto';
  import type { CreateSecretPayload } from '../lib/schema';
  import CreateSecretForm from './CreateSecretForm.svelte';
  import PresentShareLink from './PresentShareLink.svelte';

  let shareData: { link: string; password?: string; oneClick: boolean } | null =
    null;

  async function handleSubmit(data: CreateSecretPayload) {
    const secret = await encryptData(data.secret, data.passphrase);
    const result = await fetch('/api/secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expire: data.expire,
        destruct: data.destruct,
        secret
      })
    });

    if (result.ok) {
      const { id } = await result.json();
      const baseUrl = getShareUrl(id);

      if (data.oneClick) {
        // One-click: embed password in URL hash
        shareData = {
          link: baseUrl + '#' + encodeURIComponent(data.passphrase),
          oneClick: true
        };
      } else {
        // Manual: separate link and password
        shareData = {
          link: baseUrl,
          password: data.passphrase,
          oneClick: false
        };
      }
    }
  }

  function handleCreateAnother() {
    shareData = null;
  }

  function getShareUrl(id: string) {
    const baseUrl = location.origin;
    return `${baseUrl}/share/${id}`;
  }
</script>

{#if shareData}
  <PresentShareLink onCreateAnother={handleCreateAnother} {shareData} />
{:else}
  <CreateSecretForm onSubmit={handleSubmit} />
{/if}
