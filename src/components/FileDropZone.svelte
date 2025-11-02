<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  export let onFileInput: (_fileList: FileList) => void;

  let isDragOver = false;
  let dropZoneElement: HTMLElement;

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    if (!dropZoneElement.contains(e.relatedTarget as Node)) {
      isDragOver = false;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;

    if (!e.dataTransfer?.files) {
      return;
    }

    onFileInput(e.dataTransfer.files);
  }
</script>

<div
  bind:this={dropZoneElement}
  class={twMerge('relative', $$props.class)}
  on:dragenter={handleDragEnter}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="button"
  tabindex="0"
>
  <slot />

  {#if isDragOver}
    <div
      class="fixed inset-0 animate-pulse-violet bg-opacity-20 border-2 border-dashed border-primary-500 z-50 flex items-center justify-center"
    >
      <div class="bg-background p-6 rounded-lg shadow-lg">
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="mt-2 text-lg font-medium text-muted-900">
            Drop files to add to secret
          </p>
          <p class="text-sm text-muted-500">
            Files will be encoded and encrypted with your message
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
