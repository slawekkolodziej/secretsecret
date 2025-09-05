<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  export let id = '';
  export let label = '';
  export let value = '';
  export let error = '';
  export let description: string | null = null;
</script>

<div class={$$props.class}>
  {#if label}
    <label
      for={id}
      class={twMerge(
        'block text-muted-700 text-sm font-bold mb-1',
        error ? 'text-destructive-600' : ''
      )}
    >
      {label}
    </label>
  {/if}
  <input
    {...$$restProps}
    {id}
    class={twMerge(
      'appearance-none border border-muted-200 rounded w-full py-1.5 px-3',
      'text-muted-700 leading-tight transition-all bg-background',
      'focus:outline-none focus:ring-2 focus:ring-primary-400 text-base text-muted-500',
      error ? 'ring-2 ring-destructive-300' : ''
    )}
    bind:value
  />

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
