<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button
  {type}
  on:click
  class="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-400"
>
  <slot />
</button>
