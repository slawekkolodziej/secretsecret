<script lang="ts">
  import { parse, isValiError } from "valibot";
  import Select from "svelte-select";
  import omgopass from 'omgopass';
  import {
    MAX_SECRET_LENGTH,
    MAX_PASS_LENGTH,
    createSecretSchema,
    type CreateSecretPayload,
    type CreateSecretFormData,
  } from "../lib/schema";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import TextArea from "./TextArea.svelte";
  import CheckBox from "./CheckBox.svelte";
  import FormField from "./FormField.svelte";
  import Collapsible from './Collapsible.svelte';
  import { persistentStore } from '../lib/persistentStore';

  export let onSubmit = (_data: CreateSecretPayload) =>
    console.error(`Missing submit handler`);

  const expireOptions = [
    { label: "7 days", value: 3600 * 24 * 7 },
    { label: "1 day", value: 3600 * 24 },
    { label: "8 hours", value: 3600 * 8 },
    { label: "4 hours", value: 3600 * 4 },
    { label: "1 hour", value: 3600 },
  ];

  const formOptions = persistentStore('form-options', {
    expanded: false,
    expireIn: expireOptions[0],
    destruct: true,
    oneClick: true
  });

  let formData = getInitialFormData();
  let isSaving = false;
  let errors: Record<string, string> = {};
  
  let remainingCharacters: number;
  let charactersLeftMessage: string;
  
  $: remainingCharacters = MAX_SECRET_LENGTH - formData.secret.length;
  $: charactersLeftMessage = remainingCharacters >= 0
    ? `${remainingCharacters} characters left`
    : `${Math.abs(remainingCharacters)} characters over limit`;

  $: $formOptions.expireIn = formData.expire;
  $: $formOptions.destruct = formData.destruct;
  $: $formOptions.oneClick = formData.oneClick;

  function getInitialFormData(): CreateSecretFormData {
    const defaultExpire = expireOptions[0];
    const persistedExpire = $formOptions?.expireIn
      ? expireOptions.find(opt => opt.value === $formOptions?.expireIn.value)
      : defaultExpire

    return {
      expire: persistedExpire ?? defaultExpire,
      destruct: $formOptions.destruct ?? true,
      oneClick: $formOptions.oneClick ?? true,
      secret: "",
      passphrase: generatePassword(),
    };
  }

  async function handleSubmit() {
    const values: CreateSecretPayload = {
      ...formData,
      expire: String(formData.expire.value),
    };

    isSaving = true;
    errors = {};
    try {
      // Validate
      const parsedValues = parse(createSecretSchema, values);
      // Store
      await onSubmit(parsedValues);
      // Reset form
      formData = getInitialFormData();
    } catch (err) {

      if (isValiError(err)) {
        errors = err.issues.reduce((errors, issue) => {
          const key = issue.path?.map(path => path.key).join('.');

          if (!key) {
            return errors;
          }

          return {
            ...errors,
            [key]: issue.message,
          }
        }, {});
      } else {
        console.error(err);
      }
    }
    isSaving = false;
  }

  function generatePassword() {
    return omgopass({
      syllablesCount: 6,
      minSyllableLength: 3,
      maxSyllableLength: 6,
      hasNumbers: false,
      titlecased: false,
      separators: "-",
    });
  }

  function updatePassword() {
    formData.passphrase = generatePassword()
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <TextArea
    label="Secret content:"
    id="secret"
    class="mb-8"
    textAreaClass="h-32"
    placeholder="Put your content here to securely share it with others..."
    error={errors.secret}
    bind:value={formData.secret}
  >
    <div slot="description" class="text-end" class:text-red-600={remainingCharacters < 0}>
        {charactersLeftMessage}
    </div>
  </TextArea>

  <Collapsible class="bg-slate-50 -mx-4 p-4" bind:expanded={$formOptions.expanded}>
    <svelte:fragment slot="label">
      Privacy Settings
    </svelte:fragment>
  
    <svelte:fragment slot="content">
      <div class="grid grid-flow-row grid-cols-4 gap-x-2 gap-y-4">
        <div class="col-span-4 relative">
          <Input
            id="passphrase"
            label="Password to protect your secret:"
            placeholder="Password used to encrypt your secret..."
            error={errors.passphrase}
            type="text"
            maxLength={MAX_PASS_LENGTH}
            autocomplete="off"
            bind:value={formData.passphrase}
            class="width-full"
          />
          <button type="button" aria-label="Generate new password" class="absolute top-0 right-0 mt-8.5 mr-3 cursor-pointer" on:click={updatePassword}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 13v-1a8 8 0 0 1 14.2-5m1.7 4 .1 1a8 8 0 0 1-14 5.3m3-.3H6v.3M18.2 4v3m0 0v0h-3M6 20v-2.7"/>
            </svg>
          </button>
        </div>

        <div class="select-wrapper col-span-4">
          <label
            for="expiration"
            class="block text-gray-700 text-sm font-bold mb-1"
          >
            Expire in
          </label>
          <Select
            id="expiration"
            items={expireOptions}
            bind:value={formData.expire}
            clearable={false}
            showChevron
            class="leading-5"
          />
        </div>

        <div class="col-span-4">
          <FormField id="destruct" label="Self destruction">
            <CheckBox
              id="destruct"
              bind:checked={formData.destruct}
              label="Auto delete after first read"
            />
          </FormField>
        </div>

        <div class="col-span-4">
          <FormField id="one-click" label="Single click access">
            <CheckBox
              id="one-click"
              bind:checked={formData.oneClick}
              label="Embed password in the hash part of the generated URL"
            />
          </FormField>
        </div>
      </div>
    </svelte:fragment>
  </Collapsible>

  <Collapsible class="bg-slate-50 -mx-4 p-4 border-gray-200/75 border-t-1" expanded>
    <svelte:fragment slot="label">
      How does it work?
    </svelte:fragment>

    <svelte:fragment slot="content">
      <div class="space-y-6">
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-gray-700">How it works</h2>
          <ol class="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Type the secret that you want to share</li>
            <li>Click the "Encrypt" button</li>
            <li>Share the link with your recipient</li>
          </ol>
        </div>

        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-gray-700">Security details</h2>
          <div class="text-sm text-gray-600 space-y-2">
            <p>
              Your secret is encrypted in your browser using the <a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto" target="_blank">Web Crypto API</a> with PBKDF2 key derivation. The password never leaves your device.
            </p>
            <p>
              One-click links embed the password in the URL hash fragment (#), which is never sent to the server, ensuring complete client-side security.
            </p>
          </div>
        </div>
      </div>
    </svelte:fragment>
  </Collapsible>

  <div class="flex items-center justify-center mt-8">
    <Button type="submit">{isSaving ? "Working..." : "Encrypt"}</Button>
  </div>
</form>

<style lang="postcss">
  @reference '../styles/global.css';

  :global(.select-wrapper) {
    --border: 1px solid var(--color-gray-200);
    --border-hover: 1px solid var(--color-gray-200);
    --border-focused: 1px solid var(--color-gray-200);
    --border-radius: 0.25rem;
    --height: 40px;
    --max-height: 40px;
  }

  .select-wrapper :global(.svelte-select) {
    @apply transition-all;
  }
  .select-wrapper :global(.svelte-select.focused) {
    @apply ring-2 ring-focused;
  }
  .select-wrapper > :global(.svelte-select .item.hover) {
    background-color: theme(colors.violet.100) !important;
    color: theme(colors.violet.900) !important;
  }
  .select-wrapper > :global(.svelte-select .item.active) {
    background-color: theme(colors.violet.500) !important;
    color: theme(colors.violet.100) !important;
  }
</style>
