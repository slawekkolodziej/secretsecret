<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  export let labelClass: string = '';
  export let expanded: boolean = false;
</script>

<div class={$$props.class}>
  <label class="select-none cursor-pointer">
    <div
      class={twMerge(
        'text-lg flex flex-row items-center justify-between',
        labelClass
      )}
    >
      <input class="hidden" type="checkbox" bind:checked={expanded} />
      <slot name="label" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        class={twMerge('transition', expanded ? 'rotate-0' : 'rotate-180')}
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m17 9.5-5 5-5-5"
        />
      </svg>
    </div>
  </label>

  {#if $$slots.content}
    {#if expanded}
      <span class="block text-sm text-muted-500 space-y-4 mt-4">
        <slot name="content" />
      </span>
    {/if}
  {/if}
</div>
