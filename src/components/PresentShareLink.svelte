<script lang="ts">
  import CreateAnotherButton from './CreateAnotherButton.svelte';

  export let shareData: { link: string; password?: string; oneClick: boolean };
  export let onCreateAnother: any;
  
  function handleFocus(e: any) {
    e.target.select();
  }
</script>

<div class="space-y-16 flex flex-col">
  <h1 class="text-violet-800 text-xl text-center">Your secret is ready!</h1>

  <div class="space-y-2">
    <label for="link-to-share" class="block text-gray-700 text-sm font-bold">
      Your secret link:
    </label>
    <input
      class="appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
      id="link-to-share"
      type="text"
      readOnly={true}
      on:focus={handleFocus}
      bind:value={shareData.link}
    />
    {#if shareData.oneClick}
      <p class="mt-2">You're all set! Just send this link to whoever needs it.</p>
    {:else}
      <label for="password-to-share" class="block text-gray-700 text-sm font-bold">
        Password:
      </label>
      <input
        id="password-to-share"
        class="appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        type="text"
        readOnly={true}
        on:focus={handleFocus}
        bind:value={shareData.password}
      />

      <p class="mt-2">
        You're all set! Just send this link and password to whoever needs access - they'll need both.
      </p>
    {/if}
  </div>

  <CreateAnotherButton onClick={onCreateAnother} />
</div>
