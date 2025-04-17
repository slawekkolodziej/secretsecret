<script>
  import { twMerge } from "tailwind-merge";

  export let checked = false;
  export let label = "";
  export let id = "";

  const checkbox = {
    wrapperBase:
      "relative block cursor-pointer pointer-events-auto h-6 w-10 grow-0 shrink-0 basis-[40px] rounded-full p-1 ring-1 ring-inset transition duration-200 ease-in-out",
    toggleBase:
      "h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-slate-700/10 transition duration-200 ease-in-out",
    wrapperUnchecked: "bg-slate-900/10 ring-slate-900/5",
    wrapperChecked: "bg-violet-600 ring-black/20",
    toggleUnchecked: "",
    toggleChecked: "translate-x-4",
  };
</script>

<div class='flex items-center relative'>
  <input
    {id}
    type="checkbox"
    class="checkboxBase absolute inset-0 -z-10 opacity-0"
    bind:checked
  />
  <label for={id} class="py-2 px-2 rounded flex flex-row gap-2">
    <div
      class={twMerge(
        checkbox.wrapperBase,
        checked ? checkbox.wrapperChecked : checkbox.wrapperUnchecked
      )}
    >
      <div
        class={twMerge(
          checkbox.toggleBase,
          checked ? checkbox.toggleChecked : checkbox.toggleUnchecked
        )}
      ></div>
    </div>
    <span class="select-none">{label}</span>
  </label>
</div>

<style lang="postcss">
  @reference '../styles/global.css' 

  .checkboxBase + label {
    @apply flex flex-row space-x-2 transition-all;
  }

  .checkboxBase:focus + label {
    @apply ring-2 ring-focused;
  }
</style>
