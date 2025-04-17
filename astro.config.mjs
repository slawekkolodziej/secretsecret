import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [svelte()],
  adapter: vercel({
    analytics: false
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});