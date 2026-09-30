# CRM Platform

Django-бэкенд и React-фронтенд для внутренней CRM.

```
backend/   Django + DRF: модели на общем BaseMixin (UUID, мягкое удаление)
crm/       React 19 + TypeScript + Vite
```

## Запуск одной командой

```bash
cp .env.example .env
docker compose up
```

Поднимутся четыре сервиса:

| Сервис     | Адрес                 | Что это                                   |
| ---------- | --------------------- | ----------------------------------------- |
| `frontend` | http://localhost:5173 | vite с горячей перезагрузкой              |
| `backend`  | http://localhost:8000 | django runserver, миграции накатятся сами |
| `db`       | localhost:5432        | PostgreSQL                                |
| `redis`    | localhost:6379        | Redis                                     |

Открывать нужно **http://localhost:5173** — фронтенд проксирует `/api` на бэкенд,
поэтому браузер видит один источник и CORS не нужен.

Исходники смонтированы внутрь контейнеров: правки в `backend/` и `crm/`
подхватываются без пересборки. Пересборка нужна только после изменения
зависимостей:

```bash
docker compose up --build
```

Полезное:

```bash
docker compose logs -f backend          # логи одного сервиса
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test
docker compose exec frontend npm test
docker compose down                     # остановить
docker compose down -v                  # остановить и стереть данные БД
```

Бэкенд пересобран с нуля: сейчас в нём только модели (`User`, `Organization`,
`Branch`, `City`, `Staff`) и админка, API и входа по коду пока нет. Фронтенд
работает на демо-данных из `crm/src/mocks`.

Фронтенд стартует, не дожидаясь готовности бэкенда: пока тот поднимается,
в интерфейсе висит плашка «сервер недоступен», которая сама снимется, как
только `/api/health/` ответит.

### Админка

При старте контейнера создаётся суперпользователь **`admin` / `admin`** —
http://localhost:8000/admin/. Телефон и остальные поля заполняются там же.

Команда идемпотентна: существующего пользователя не трогает и пароль не
перезаписывает. Вручную — `docker compose exec backend python manage.py createdevadmin`.

При `DEBUG=false` она ничего не делает, чтобы слабый пароль не уехал на прод.
Если суперпользователь нужен и там:

```bash
docker compose exec backend python manage.py createdevadmin --force --password <свой-пароль>
```

Логины и пароли настраиваются переменными `DJANGO_ADMIN_USERNAME` и
`DJANGO_ADMIN_PASSWORD` либо флагами `--username` / `--password`.

## Запуск без docker

Бэкенд:

```bash
cd backend
uv sync
cp ../.env.example .env        # без DATABASE_URL возьмётся локальный sqlite
uv run python manage.py migrate
uv run python manage.py runserver
```

Фронтенд:

```bash
cd crm
npm install
npm run dev
```

По умолчанию vite проксирует `/api` на `http://127.0.0.1:8000`.

## Проверки здоровья

- `GET /api/health/` — готовность: проверяет базу, отвечает 503, если она недоступна.
  Её опрашивают docker healthcheck и фронтенд.
- `GET /api/health/live/` — живость процесса, отвечает всегда.

## Правила разработки

Соглашения по фронтенду обязательны и лежат в [crm/RULES.md](crm/RULES.md).
