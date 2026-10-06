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

All business sections use the Django API by default. Set `VITE_DEMO_DATA=on` to
explore the product without a server; see [src/mocks/README.md](./src/mocks/README.md).

Vite proxies `/api` requests to the backend during local development. Inside
docker the proxy target is overridden with the `API_PROXY_TARGET` variable.

## Sections

`Обзор`, `Журнал` (day, week, list, deal payment), `Клиенты`, `Рассылки`,
`Специалисты`, `Услуги`, `Лояльность`, `Финансы`, `Аналитика`, `Обучение`,
`Поддержка` and `Настройки`. Theme, language, and active branch are switched
from the profile menu.

## Structure

- `src/modules` — business modules with their own API, hooks, and components.
- `src/lib` — framework-independent shared utilities.
- `src/ui` — project-owned wrappers around Material UI components.
- `src/mocks` — optional in-memory demo dataset for offline product demos.

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
