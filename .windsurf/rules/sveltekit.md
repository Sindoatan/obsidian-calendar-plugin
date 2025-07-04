---
trigger: always_on
---

---
trigger: glob
description: This rule explains SvelteKit conventions and best practices for fullstack development.
globs: **/*.js,**/*.ts,**/*.svelte
---

# SvelteKit rules

## File Structure
- Follow the file-based routing structure with `+page.svelte` for pages and `+layout.svelte` for layouts
- Use `+page.server.js` for server-only code including data loading and form actions
- Use `+server.js` files for API endpoints
- Place reusable components in `$lib/components/` using kebab-case directories
- Store utility functions in `$lib/utils/` and types in `$lib/types/`

## Component Patterns
- Use PascalCase for component filenames (e.g., `Button.svelte`)
- Prefer named exports over default exports
- Use TypeScript in components with `<script lang="ts">`
- Keep components small and focused on a single responsibility
- Use props validation with TypeScript interfaces

## Routing & Navigation
- Prefer SvelteKit's `<a>` links over programmatic navigation when possible
- Use route parameters with proper typing in load functions
- Implement nested layouts for sections sharing UI elements
- Use `+page.js` for client-side data loading that doesn't need server access

## Data Fetching
- Use `load` functions in `+page.server.js` for server-side data fetching
- Return properly typed data from load functions
- Implement error handling with try/catch and proper status codes
- Use `depends()` to mark cache dependencies between routes

## Form Handling
- Use SvelteKit's form actions with progressive enhancement
- Implement proper validation for both client and server
- Use `use:enhance` for enhanced form experiences while maintaining no-JS fallbacks
- Return useful validation errors to display in the UI

## State Management
- Use URL state for shareable data with `$page.url.searchParams`
- Use local state ($state) for component-specific state
- Use Svelte stores for shared application state
- Implement context and setContext/getContext for component trees

## Authentication & Authorization
- Handle authentication in hooks.server.js
- Use session cookies instead of localStorage for auth tokens
- Implement proper redirect logic for protected routes
- Create a custom auth helper for checking permissions

## Error Handling
- Create customized error pages with `+error.svelte`
- Use try/catch with proper error responses in server functions
- Implement global error handling for unexpected errors
- Provide user-friendly error messages

## Performance
- Minimize use of client-side JavaScript with server components
- Implement server-side rendering for SEO and performance
- Use `<script context="module">` for shared module code
- Implement proper caching strategies for API requests

## Deployment
- Use adapter-auto or specific adapters based on hosting platform
- Configure environment variables properly for different environments
- Implement proper build and optimization settings in svelte.config.js
- Use proper Content-Security-Policy headers