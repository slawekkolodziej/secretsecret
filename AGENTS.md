# Agent Guidelines for secretsecret

## Build/Test Commands
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- No lint/test commands configured - verify changes manually

## Code Style
- **Package Manager**: Use `yarn` (v4.1.1)
- **TypeScript**: Strict mode enabled, use explicit types
- **Imports**: Use named imports, relative paths for local modules
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Validation**: Use Valibot for schema validation (`import * as v from 'valibot'`)
- **Error Handling**: Use try/catch with proper error responses (400/500 status codes)
- **API Routes**: Export named functions (POST, GET) from Astro API routes
- **Svelte**: Use `<script lang="ts">` for TypeScript, reactive statements with `$:`
- **Constants**: Use UPPER_SNAKE_CASE for module-level constants
- **Async**: Prefer async/await over promises
- **Security**: Never log or expose sensitive data (secrets, passphrases)

## Architecture
- Astro + Svelte frontend with TypeScript
- Vercel KV for storage, nanoid for IDs
- Client-side encryption with Web Crypto API