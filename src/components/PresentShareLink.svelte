<script lang="ts">
  export let shareLink: string;
  export let onCreateAnother: any;
  
  function handleFocus(e: any) {
    e.target.select();
  }
</script>

<div class="space-y-8">
  <div class="space-y-2">
    <label
      class="block text-gray-700 text-sm font-bold"
      for="passphrase"
    >
      Your secret link:
    </label>
    <input
      class="appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      type="text"
      readOnly={true}
      on:focus={handleFocus}
      bind:value={shareLink}
    />
    <span class="block text-sm text-gray-500 space-y-2">
      <span class="block">
        Remember to share the link and password generated earlier.
      </span>
    </span>
  </div>

  <div class="flex items-center justify-center">
    <button
      on:click={onCreateAnother}
      class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="submit"
    >
      Create another
    </button>
  </div>
</div>