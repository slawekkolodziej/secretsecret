<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let id = "";
  export let label = "";
  export let value = "";
  export let error = "";
  export let textAreaClass = "";
  export let onClick = (_e: any) => {};
  export let description: string | null = null;
</script>

<div class={twMerge("space-y-2", $$props.class)}>
  {#if label}
    <label
      for={id}
      class={twMerge(
        "block text-gray-700 text-sm font-bold mb-2",
        error ? "text-red-600" : ""
      )}
    >
      {label}
    </label>
  {/if}
  <textarea
    {...$$restProps}
    {id}
    class={twMerge(
      "appearance-none border rounded w-full py-2 px-3",
      "text-gray-700 leading-tight transition-all",
      "focus:outline-none focus:ring-2 focus:ring-focused",
      error ? "ring-2 ring-red-300" : "",
      textAreaClass
    )}
    bind:value
    on:click|preventDefault={onClick}
  >
  </textarea>

  {#if error}
    <span class="block text-sm text-red-600 space-y-2">
      {error}
    </span>
  {/if}

  {#if description}
    <span class="block text-sm text-gray-500 space-y-2">
      {description}
    </span>
  {:else if $$slots.description}
    <span class="block text-sm text-gray-500 space-y-2">
      <slot name="description" />
    </span>
  {/if}
</div>
