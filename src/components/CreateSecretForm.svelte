<script lang="ts">
  import { parse, isValiError } from 'valibot';
  import Select from 'svelte-select';
  import omgopass from 'omgopass';
  import {
    MAX_SECRET_LENGTH,
    MAX_PASS_LENGTH,
    createSecretSchema,
    type CreateSecretPayload,
    type CreateSecretFormData
  } from '../lib/schema';
  import Button from './Button.svelte';
  import Input from './Input.svelte';
  import TextArea from './TextArea.svelte';
  import CheckBox from './CheckBox.svelte';
  import FormField from './FormField.svelte';
  import Collapsible from './Collapsible.svelte';
  import FileDropZone from './FileDropZone.svelte';
  import AttachedFiles from './AttachedFiles.svelte';
  import { persistentStore } from '../lib/persistentStore';
  import {
    calculateSecretSize,
    formatSecretSize,
    type FileData
  } from '../lib/schema';

  export let onSubmit = (_data: CreateSecretPayload) =>
    console.error(`Missing submit handler`);

  const expireOptions = [
    { label: '7 days', value: 3600 * 24 * 7 },
    { label: '1 day', value: 3600 * 24 },
    { label: '8 hours', value: 3600 * 8 },
    { label: '4 hours', value: 3600 * 4 },
    { label: '1 hour', value: 3600 }
  ];

  const formOptions = persistentStore('form-options', {
    expanded: false,
    expireIn: expireOptions[0],
    destruct: true,
    oneClick: true
  });

  const helpOptions = persistentStore('help-options', {
    expanded: true
  });

  let formData = getInitialFormData();
  let isSaving = false;
  let errors: Record<string, string> = {};
  let generalError = '';
  let attachedFiles: FileData[] = [];

  $: secretSize = calculateSecretSize(formData.secret, attachedFiles);
  $: remainingSize = MAX_SECRET_LENGTH - secretSize;
  $: sizeMessage =
    remainingSize >= 0
      ? `${formatSecretSize(remainingSize)} remaining`
      : `${formatSecretSize(Math.abs(remainingSize))} over limit`;

  $: $formOptions.expireIn = formData.expire;
  $: $formOptions.destruct = formData.destruct;
  $: $formOptions.oneClick = formData.oneClick;

  function getInitialFormData(): CreateSecretFormData {
    const defaultExpire = expireOptions[0];
    const persistedExpire = $formOptions?.expireIn
      ? expireOptions.find((opt) => opt.value === $formOptions?.expireIn.value)
      : defaultExpire;

    return {
      expire: persistedExpire ?? defaultExpire,
      destruct: $formOptions.destruct ?? true,
      oneClick: $formOptions.oneClick ?? true,
      secret: '',
      passphrase: generatePassword(),
      files: []
    };
  }

  async function handleSubmit() {
    isSaving = true;
    errors = {};
    generalError = '';

    try {
      const validData = parse(createSecretSchema, {
        ...formData,
        expire: String(formData.expire.value),
        files: attachedFiles
      });

      await onSubmit(validData);
    } catch (err) {
      if (isValiError(err)) {
        errors = err.issues.reduce((errors, issue) => {
          const key = issue.path?.map((path) => path.key).join('.');

          if (!key) {
            generalError = issue.message;
            return errors;
          }

          return {
            ...errors,
            [key]: issue.message
          };
        }, {});
      } else {
        console.error('Submission error:', err);
      }
    }
    isSaving = false;
  }

  function handleFilesChange(files: FileData[]) {
    attachedFiles = files;
  }

  function processFileList(fileList: FileList): Promise<FileData[]> {
    return new Promise((resolve) => {
      const newFiles: FileData[] = [];
      const filesArray = Array.from(fileList);
      let processedCount = 0;

      const tryToResolve = () => {
        processedCount += 1;

        if (processedCount === filesArray.length) {
          resolve(newFiles);
        }
      };

      filesArray.forEach((file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          if (event.target?.result) {
            const fileData: FileData = {
              name: file.name,
              dataUri: event.target.result as string,
              size: file.size
            };
            newFiles.push(fileData);
            tryToResolve();
          }
        };
        reader.onerror = (_event) => {
          console.log('Could not load this file:', file.name);
          tryToResolve();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  async function handleFileInput(fileList: FileList) {
    if (!fileList || fileList.length === 0) {
      console.log('why are we here?');
      return;
    }

    const newFiles = await processFileList(fileList);
    attachedFiles = [...attachedFiles, ...newFiles];
    handleFilesChange(attachedFiles);
  }

  let fileInput: HTMLInputElement;

  function openFileDialog(e) {
    e.preventDefault();
    fileInput?.click();
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      handleFileInput(input.files);
      input.value = '';
    }
  }

  function generatePassword() {
    return omgopass({
      syllablesCount: 6,
      minSyllableLength: 3,
      maxSyllableLength: 6,
      hasNumbers: false,
      titlecased: false,
      separators: '-'
    });
  }

  function updatePassword() {
    formData.passphrase = generatePassword();
  }

  function handleDelete(_file: FileData, index: number) {
    attachedFiles = attachedFiles.filter((_, i) => i !== index);
    handleFilesChange(attachedFiles);
  }
</script>

<FileDropZone
  files={attachedFiles}
  onFilesChange={handleFilesChange}
  onFileInput={handleFileInput}
  class="space-y-16 flex flex-col"
>
  <h1 class="text-primary-800 text-xl text-center">
    Got something sensitive to share?
  </h1>

  <form on:submit|preventDefault={handleSubmit}>
    <TextArea
      label="Secret content:"
      id="secret"
      class="mb-4"
      textAreaClass="h-64"
      placeholder={[
        'Put your content here to securely share it with others.',
        'You can also drag & drop files here.',
        '',
        'Everything is encrypted locally, inside your browser, before it gets uploaded!'
      ].join('\n')}
      error={errors.secret || generalError}
      bind:value={formData.secret}
    >
      <div
        slot="labelRight"
        class="text-end"
        class:text-destructive-600={remainingSize < 0}
      >
        {sizeMessage} |
        <button on:click={openFileDialog} class="cursor-pointer"
          >attach files</button
        >
      </div>
    </TextArea>

    <input
      bind:this={fileInput}
      type="file"
      multiple
      style="display: none"
      on:change={handleFileSelect}
    />

    {#if attachedFiles.length > 0}
      <div class="mb-8 space-y-2">
        <AttachedFiles files={attachedFiles} onDelete={handleDelete} />
      </div>
    {:else}
      <div class="mb-8"></div>
    {/if}

    <div class="flex items-center justify-center my-8">
      <Button type="submit">{isSaving ? 'Working...' : 'Encrypt'}</Button>
    </div>

    <Collapsible
      class="bg-neutral-50 p-4"
      bind:expanded={$formOptions.expanded}
    >
      <svelte:fragment slot="label">Privacy Settings</svelte:fragment>

      <svelte:fragment slot="content">
        <div class="space-y-4">
          <div class="relative">
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
            <button
              type="button"
              aria-label="Generate new password"
              class="absolute top-0 right-0 mt-8.5 mr-3 cursor-pointer"
              on:click={updatePassword}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 13v-1a8 8 0 0 1 14.2-5m1.7 4 .1 1a8 8 0 0 1-14 5.3m3-.3H6v.3M18.2 4v3m0 0v0h-3M6 20v-2.7"
                />
              </svg>
            </button>
          </div>

          <hr class="my-6 border-neutral-200" />
          <p>Settings below are stored locally in your browser.</p>

          <div class="select-wrapper">
            <label
              for="expiration"
              class="block text-muted-700 text-sm font-bold mb-1"
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

          <FormField id="destruct" label="Self destruction">
            <CheckBox
              id="destruct"
              bind:checked={formData.destruct}
              label="Auto delete after first read"
            />
          </FormField>

          <FormField id="one-click" label="Single click access">
            <CheckBox
              id="one-click"
              bind:checked={formData.oneClick}
              label="Embed password in the hash part of the generated URL"
            />
          </FormField>
        </div>
      </svelte:fragment>
    </Collapsible>

    <Collapsible
      class="bg-neutral-50 p-4 border-muted-200/75 border-t-1"
      bind:expanded={$helpOptions.expanded}
    >
      <svelte:fragment slot="label">Instructions</svelte:fragment>

      <svelte:fragment slot="content">
        <div class="space-y-6">
          <div class="space-y-2">
            <h2 class="text-lg font-semibold text-muted-700">How to use it?</h2>
            <ol
              class="list-decimal list-inside space-y-1 text-sm text-muted-600"
            >
              <li>Type the secret that you want to share</li>
              <li>Click the "Encrypt" button</li>
              <li>Share the link with your recipient</li>
            </ol>
          </div>

          <div class="space-y-2">
            <h2 class="text-lg font-semibold text-muted-700">
              Security details
            </h2>
            <div class="text-sm text-muted-600 space-y-2">
              <ul class="list-disc pl-4 space-y-4">
                <li>
                  Your secret is encrypted in your browser using the <a
                    class="underline"
                    href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto"
                    target="_blank"
                  >
                    Web Crypto API</a
                  > with PBKDF2 key derivation. The password never leaves your device.
                </li>
                <li>
                  One-click links embed the password in the URL hash fragment
                  (#), which is never sent to the server, ensuring complete
                  end-to-end security.
                </li>
                <li>
                  Files are never directly uploaded to the server. Instead their
                  content is read using
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/FileReader"
                    class="underline">FileReader API</a
                  >, converted to
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Glossary/Base64"
                    class="underline">Base64</a
                  >
                  and appended to your secret.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </svelte:fragment>
    </Collapsible>
  </form>
</FileDropZone>

<style lang="postcss">
  @reference '../styles/global.css';

  :global(.select-wrapper) {
    --tw-ring-color: rgb(139 92 246 / var(--tw-ring-opacity));
  }

  :global(.select-wrapper .svelte-select) {
    height: 42px;

    --border: 1px solid var(--color-muted-200);
    --border-focused: 1px solid var(--color-muted-200);
    --border-hover: 1px solid var(--color-muted-200);
    --border-radius: 0.25rem;

    --background: var(--color-background);
    --list-background: var(--color-background);

    --item-hover-bg: var(--color-primary-50);
    --item-hover-color: var(--color-primary-500);
    --item-is-active-bg: var(--color-primary-600);
    --item-is-active-color: var(--color-slate-50);
  }

  :global(.dark .select-wrapper .svelte-select) {
    --item-hover-color: var(--color-slate-50);
    --item-is-active-bg: var(--color-primary-200);
  }

  :global(.select-wrapper .svelte-select.focused) {
    outline: 2px solid var(--color-primary-400);
  }
</style>
