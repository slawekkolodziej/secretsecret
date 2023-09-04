<script lang="ts">
  import { ZodError } from "zod";
  import { secretSchema } from "../lib/schema";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import TextArea from "./TextArea.svelte";
  import type { CreateSecretPayload } from "./types";

  export let onSubmit = (_data: CreateSecretPayload) =>
    console.error(`Missing submit handler`);

  const getInitialFormData = (): CreateSecretPayload => ({
    secret: "",
    passphrase: "",
  });

  let formData = getInitialFormData();
  let isSaving = false;
  let errors: Record<string, string> = {};

  const handleSubmit = async () => {
    isSaving = true;
    errors = {};
    try {
      // Validate
      const parsedData = secretSchema.parse(formData);
      // Store
      await onSubmit(parsedData);
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
  };
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-8">
  <TextArea
    label="Secret content:"
    class="h-32"
    id="secret"
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
        Create a non-obvious password and share it along with the link that you
        are going to see after clicking the &quot;Save&quot; button.
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

  <div class="flex items-center justify-center">
    <Button type="submit">{isSaving ? "Saving..." : "Save"}</Button>
  </div>
</form>
