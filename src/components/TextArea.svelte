<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  export let id = '';
  export let label = '';
  export let value = '';
  export let error = '';
  export let textAreaClass = '';
  export let onClick = (_e: any) => {};
  export let labelRight: string | null = null;
</script>

<div class={twMerge('space-y-2', $$props.class)}>
  <div class="flex flex-row justify-between">
    {#if label}
      <label
        for={id}
        class={twMerge(
          'block text-muted-700 text-sm font-bold',
          error ? 'text-destructive-600' : ''
        )}
      >
        {label}
      </label>
    {/if}

    {#if labelRight}
      <span class="block text-sm text-muted-500">
        {labelRight}
      </span>
    {:else if $$slots.labelRight}
      <span class="block text-sm text-muted-500">
        <slot name="labelRight" />
      </span>
    {/if}
  </div>
  <textarea
    {...$$restProps}
    {id}
    class={twMerge(
      'appearance-none border rounded w-full py-2 px-3',
      'text-muted-700 leading-tight transition-all',
      'focus:outline-none focus:ring-2 focus:ring-primary-400',
      'text-md leading-6',
      error ? 'ring-2 ring-destructive-300' : '',
      textAreaClass
    )}
    bind:value
    on:click|preventDefault={onClick}
  >
  </textarea>

  {#if error}
    <span class="block text-sm text-destructive-600 space-y-2">
      {error}
    </span>
  {/if}
</div>
