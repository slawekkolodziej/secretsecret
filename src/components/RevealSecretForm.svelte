<script lang="ts">
  import { decryptData } from "../lib/browserCrypto";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";

  export let id = "";
  export let encryptedData = "";

  let secret = "";
  let passphrase = "";

  async function handleDecrypt() {
    try {
      await fetch(`/api/secrets/${id}`, {
        method: "delete",
      });

      secret = await decryptData(encryptedData, passphrase);
      passphrase = "";
    } catch (err) {
      console.error(err);
    }
  }

  function conceal() {
    secret = "";
  }
</script>

{#if secret}
  <div class="space-y-8">
    <div class="space-y-2">
      <label for="secret" class="block text-gray-700 text-sm font-bold mb-2">
        Secret:
      </label>
      <textarea
        id="secret"
        class="appearance-none border w-full h-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        readOnly
        bind:value={secret}
        on:click|preventDefault={(e) => e.currentTarget.select()}
      />
    </div>

    <div class="flex items-center justify-center space-x-2">
      <Button on:click={conceal}>Conceal</Button>
      <a
        href="/"
        class="text-gray-400 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Create your own shared secret
      </a>
    </div>
  </div>
{:else}
  <form on:submit|preventDefault={handleDecrypt} class="space-y-8">
    <Input
      id="passphrase"
      label="Passphrase:"
      name="hello"
      description="You should receive this passphrase from the person who gave you this link"
      bind:value={passphrase}
    />

    <div class="flex items-center justify-center space-x-2">
      <Button type="submit">Decrypt</Button>
      <a
        href="/"
        class="text-gray-400 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        or create your own shared secret
      </a>
    </div>
  </form>
{/if}
