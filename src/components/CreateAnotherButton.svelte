<script lang="ts">
  export let label = 'Create another secret';
  export let onClick: () => void = () => {
    window.location.href = '/';
  };
</script>

<div class="flex items-center justify-center">
  <button
    on:click={onClick}
    class="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
    type="submit"
  >
    {label}
  </button>
</div>
