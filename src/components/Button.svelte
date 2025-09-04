<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button
  {type}
  on:click
  class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-focused"
>
  <slot />
</button>
