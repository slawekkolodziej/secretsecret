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
        'block text-gray-700 text-sm font-bold mb-1',
        error ? 'text-red-600' : ''
      )}
    >
      {label}
    </label>
  {/if}
  <input
    {...$$restProps}
    {id}
    class={twMerge(
      'appearance-none border border-gray-200 rounded w-full py-1.5 px-3',
      'text-gray-700 leading-tight transition-all bg-white',
      'focus:outline-none focus:ring-2 focus:ring-focused text-base text-gray-500',
      error ? 'ring-2 ring-red-300' : ''
    )}
    bind:value
  />

  {#if error}
    <span class="block text-sm text-red-600 space-y-2">
      {error}
    </span>
  {/if}

  {#if description}
    <span class="block text-sm text-gray-500 space-y-4">
      {description}
    </span>
  {:else if $$slots.description}
    <span class="block text-sm text-gray-500 space-y-4">
      <slot name="description" />
    </span>
  {/if}
</div>
