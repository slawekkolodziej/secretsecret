<script lang="ts">
  import { decryptData } from "../lib/browserCrypto";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import TextArea from "./TextArea.svelte";

  export let id = "";
  export let destruct = true;
  export let expireIn = "";
  export let encryptedData = "";

  let secret = "";
  let passphrase = "";
  let errors: Record<string, string> = {};

  async function handleDecrypt() {
    errors = {};

    try {
      secret = await decryptData(encryptedData, passphrase);
      passphrase = "";
    } catch (err) {
      errors = {
        passphrase: "This password is not valid.",
      };
    }

    if (destruct) {
      try {
        await fetch(`/api/secrets/${id}`, {
          method: "delete",
        });
      } catch (err) {
        console.error(`Could not delete ${id}`, err);
      }
    }
  }

  function handleSecretClick(e: any) {
    e.currentTarget.select();
  }

  function conceal() {
    secret = "";
  }

  const headingSuffix = destruct
    ? '<br/><span class="text-red-500">or after you read it.</span>'
    : '.'
  const heading = `This secret will self-destruct in ${expireIn}${headingSuffix}`;
</script>

<div class="space-y-4">
  <h2 class="text-xl">
    {@html heading}
  </h2>

  {#if secret}
    <div class="space-y-8">
      <TextArea
        label="Secret:"
        id="secret"
        readOnly
        bind:value={secret}
        onClick={handleSecretClick}
      />

      <div class="flex items-center justify-center space-x-2">
        <Button on:click={conceal}>Conceal</Button>
        <a
          href="/"
          class="text-gray-400 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create shared secret
        </a>
      </div>
    </div>
  {:else}
    <form on:submit|preventDefault={handleDecrypt} class="space-y-8">
      <Input
        id="passphrase"
        label="Password:"
        name="hello"
        error={errors.passphrase}
        bind:value={passphrase}
      >
        <div slot="description" class="space-y-2">
          <span>
            A person who have you this link should also share this password.
          </span>
        </div>
      </Input>

      <div class="flex items-center justify-center space-x-2">
        <Button type="submit">Reveal secret</Button>
      </div>
    </form>
  {/if}
</div>
