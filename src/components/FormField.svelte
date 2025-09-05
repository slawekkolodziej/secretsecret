<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  export let id = '';
  export let label = '';
  export let error = '';
  export let description: string | null = null;
</script>

<div class="space-y-2">
  {#if label}
    <label
      for={id}
      class={twMerge(
        'block text-muted-700 text-sm font-bold mb-2',
        error ? 'text-destructive-600' : ''
      )}
    >
      {label}
    </label>
  {/if}

  <slot />

  {#if error}
    <span class="block text-sm text-destructive-600 space-y-2">
      {error}
    </span>
  {/if}

  {#if description}
    <span class="block text-sm text-muted-500 space-y-4">
      {description}
    </span>
  {:else if $$slots.description}
    <span class="block text-sm text-muted-500 space-y-4">
      <slot name="description" />
    </span>
  {/if}
</div>
