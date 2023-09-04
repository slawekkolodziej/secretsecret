<script lang="ts">
  import { encryptData } from "../lib/browserCrypto";
  import CreateSecretForm from "./CreateSecretForm.svelte";
  import PresentShareLink from "./PresentShareLink.svelte";
  import type { CreateSecretPayload } from "./types";

  let shareLink: null | string = null;

  async function handleSubmit(data: CreateSecretPayload) {
    const secret = await encryptData(data.secret, data.passphrase);
    const result = await fetch("/api/secrets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
      }),
    });

    if (result.ok) {
      const data = await result.json();
      shareLink = getShareUrl(data.id);
    }
  }

  function handleCreateAnother() {
    shareLink = null;
  }

  function getShareUrl(id: string) {
    const baseUrl = location.origin;
    return `${baseUrl}/share/${id}`;
  }
</script>

{#if shareLink}
  <PresentShareLink onCreateAnother={handleCreateAnother} shareLink={shareLink} />
{:else}
  <CreateSecretForm onSubmit={handleSubmit} />
{/if}