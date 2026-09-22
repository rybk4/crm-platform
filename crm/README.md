# CRM frontend

React + TypeScript + Vite frontend for the internal CRM.

## Development

The backend must be available at `http://127.0.0.1:8000`.

```bash
npm install
npm run dev
```

Vite proxies `/api` requests to the backend during local development.

## Structure

- `src/modules` — business modules with their own API, hooks, and components.
- `src/lib` — framework-independent shared utilities.
- `src/ui` — project-owned wrappers around Material UI components.

