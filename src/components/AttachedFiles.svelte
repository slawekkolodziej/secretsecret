<script lang="ts">
  import type { SecretData, FileData } from '../lib/schema';

  export let onDelete: ((_file: FileData, i: number) => void) | undefined =
    undefined;
  export let files: SecretData['files'] = [];
  export let enableDownloads: boolean = false;

  function downloadFile(file: FileData) {
    const link = document.createElement('a');
    link.href = file.dataUri;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="space-y-2">
  <h3 class="text-sm font-medium text-gray-700">Attached files:</h3>
  {#each files as file, index}
    <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
      <div class="flex flex-1 items-center space-x-2 overflow-hidden">
        <svg
          class="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span
          class="text-sm text-gray-700 flex-1 overflow-hidden overflow-ellipsis text-nowrap"
          >{file.name}</span
        >
        <span class="text-xs text-gray-500"
          >({file.size < 1024
            ? `${file.size} B`
            : file.size < 1024 * 1024
              ? `${(file.size / 1024).toFixed(1)} KB`
              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`})</span
        >
      </div>
      {#if onDelete}
        <button
          type="button"
          on:click={() => onDelete(file, index)}
          class="text-red-500 hover:text-red-700 cursor-pointer py-1 px-2"
          aria-label="Remove file"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      {/if}
      {#if enableDownloads}
        <button
          type="button"
          on:click={() => downloadFile(file)}
          class="bg-gray-500 hover:bg-gray-700 text-white text-sm px-4 py-1 rounded focus:outline-none focus:shadow-outline cursor-pointer"
        >
          Download
        </button>
      {/if}
    </div>
  {/each}
</div>
