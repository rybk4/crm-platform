# CRM frontend

React + TypeScript + Vite frontend for the internal CRM.

## Development

The whole stack (frontend, backend, database) starts from the repository root
with `docker compose up` — see the [root README](../README.md).

To run the frontend alone:

```bash
npm install
npm run dev
```

Sections that have no backend endpoints yet (journal, clients, analytics) are
served by a built-in demo dataset, so the app starts and can be explored without
a server. Set `VITE_DEMO_DATA=off` to send every request to the real API; see
[src/mocks/README.md](./src/mocks/README.md) for how the layer is wired and how
to remove it section by section. With demo data on, requests never reach the
backend at `http://127.0.0.1:8000`.

Vite proxies `/api` requests to the backend during local development. Inside
docker the proxy target is overridden with the `API_PROXY_TARGET` variable.

## Sections

`Обзор` (the landing screen), `Журнал` (day board and list of appointments),
`Клиенты` (base, segments, visit history), `Специалисты`, `Услуги`, `Аналитика`.
Theme and language are switched from the profile menu in the sidebar.

## Structure

- `src/modules` — business modules with their own API, hooks, and components.
- `src/lib` — framework-independent shared utilities.
- `src/ui` — project-owned wrappers around Material UI components.
- `src/mocks` — temporary demo dataset for endpoints the backend does not expose yet.

## Rules

Frontend conventions are mandatory and live in [RULES.md](./RULES.md): structure,
markup/logic separation, file size limits, styling, i18n, API layer, data fetching,
and the testing policy. Read it before the first commit.

## Checks

```bash
npm run format:check
npm run lint
npm run build
npm test
```
