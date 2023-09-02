<script lang="ts">
  import { ZodError } from "zod";
  import Select from "svelte-select";
  import {
    createSecretSchema,
    type CreateSecretPayload,
    type CreateSecretFormData,
  } from "../lib/schema";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import TextArea from "./TextArea.svelte";
  import CheckBox from "./CheckBox.svelte";
  import FormField from "./FormField.svelte";

  export let onSubmit = (_data: CreateSecretPayload) =>
    console.error(`Missing submit handler`);

  const expireOptions = [
    { label: "7 days", value: 3600 * 24 * 7 },
    { label: "1 day", value: 3600 * 24 },
    { label: "8 hours", value: 3600 * 8 },
    { label: "4 hours", value: 3600 * 4 },
    { label: "1 hour", value: 3600 },
  ];

  let formData = getInitialFormData();
  let isSaving = false;
  let errors: Record<string, string> = {};

  function getInitialFormData(): CreateSecretFormData {
    return {
      expire: expireOptions[0],
      destruct: true,
      secret: "",
      passphrase: "",
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
      const parsedValues = createSecretSchema.parse(values);
      // Store
      await onSubmit(parsedValues);
      // Reset form
      formData = getInitialFormData();
    } catch (err) {
      if (err instanceof ZodError) {
        errors = err.issues.reduce(
          (errors, issue) => ({
            ...errors,
            [issue.path.join(".")]: issue.message,
          }),
          {}
        );
      } else {
        console.error(err);
      }
    }
    isSaving = false;
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-8">
  <TextArea
    label="Secret content:"
    id="secret"
    class="h-32"
    placeholder="Put your content here to securely share it with others..."
    error={errors.secret}
    bind:value={formData.secret}
  />

  <Input
    id="passphrase"
    label="Password to protect your secret:"
    placeholder="Password used to encrypt your secret..."
    error={errors.passphrase}
    type="text"
    autocomplete="off"
    bind:value={formData.passphrase}
  >
    <svelte:fragment slot="description">
      <span class="block">
        Create a password to encrypt your secret. Share this password along with
        the link you are going to receive.
      </span>
      <span class="block">
        This password is used to derive an encryption key using PBKDF2.
      </span>
      <span class="block">
        Plain text secret NEVER leaves your browser. We only store encrypted
        data.
      </span>
    </svelte:fragment>
  </Input>

  <div class="flex flex-col md:flex-row gap-8">
    <div class="space-y-2 basis-1/3 select-wrapper">
      <label
        for="expiration"
        class="block text-gray-700 text-sm font-bold mb-2"
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

    <div class="basis-2/3">
      <FormField id="destruct" label="Self destruction">
        <CheckBox
          id="destruct"
          bind:checked={formData.destruct}
          label="Auto delete after first read"
        />
      </FormField>
    </div>
  </div>

  <div class="flex items-center justify-center">
    <Button type="submit">{isSaving ? "Working..." : "Encrypt"}</Button>
  </div>
</form>

<style lang="postcss">
  .select-wrapper {
    --border: 1px solid theme(colors.gray.200);
    --border-hover: 1px solid theme(colors.gray.200);
    --border-focused: 1px solid theme(colors.gray.200);
    --border-radius: 0.25rem;
    --height: 38px;
    --max-height: 38px;
  }

  .select-wrapper :global(.svelte-select) {
    @apply transition-all;
  }
  .select-wrapper :global(.svelte-select):has(input:focus) {
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
